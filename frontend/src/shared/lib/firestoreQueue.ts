// Persistent Firestore write queue with IndexedDB backing.
// Supports serializable operations (currently: setDoc) and non-serializable fallback functions.

import type { Firestore, SetOptions } from 'firebase/firestore'
import { doc as fsDoc, setDoc as fsSetDoc, serverTimestamp as fsServerTimestamp } from 'firebase/firestore'
import { getDb } from './firebaseClient'
import { idbGetItem, idbSetItem } from './indexedDB'

interface SerializableSetOp {
  kind: 'set'
  path: string // e.g. collection/doc (no leading slash)
  data: unknown
  merge?: boolean
  ts: number
  attempts: number
}
interface NonSerializableOp {
  kind: 'fn'
  exec: (db: Firestore) => Promise<void>
  ts: number
  attempts: number
  note?: string
}
type InternalOp = SerializableSetOp | NonSerializableOp

const PERSIST_KEY = 'firestoreQueueOps'
const ops: InternalOp[] = []
let flushing = false
let started = false
let persistTimer: number | null = null
let loaded = false
const MAX_ATTEMPTS = 8

function log(...args: unknown[]) { console.debug('[FirestoreQueue]', ...args) }

async function loadPersisted() {
  if (loaded) return
  loaded = true
  try {
    const stored = await idbGetItem<SerializableSetOp[]>(PERSIST_KEY)
    if (Array.isArray(stored)) {
      stored.forEach(op => ops.push(op))
      if (stored.length) log('Restored', stored.length, 'ops from IndexedDB')
    }
  } catch (e) {
    console.warn('[FirestoreQueue] Failed to load persisted queue', e)
  }
}

function schedulePersist() {
  if (persistTimer) return
  persistTimer = window.setTimeout(async () => {
    persistTimer = null
    try {
      const serializable = ops.filter(o => o.kind === 'set') as SerializableSetOp[]
      await idbSetItem(PERSIST_KEY, serializable)
      if (serializable.length) log('Persisted', serializable.length, 'ops')
    } catch (e) {
      console.warn('[FirestoreQueue] Persist failed', e)
    }
  }, 300)
}

function ensureListeners() {
  if (started) return
  started = true
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => flushSoon())
    setInterval(() => flushSoon(), 30000)
  }
  // Kick off load (don't await to keep caller snappy)
  loadPersisted().then(() => flushSoon())
}

function isRetryable(e: unknown): boolean {
  if (!navigator.onLine) return true
  const code = (e as { code?: string })?.code
  return code === 'unavailable' || code === 'failed-precondition' || code === 'aborted'
}

function docRef(db: Firestore, path: string) {
  const [col, ...rest] = path.split('/')
  if (!col || !rest.length) throw new Error('Invalid doc path: ' + path)
  return fsDoc(db, col, ...rest)
}

async function executeOp(op: InternalOp) {
  const db = getDb()
  if (op.kind === 'set') {
    const ref = docRef(db, op.path)
    const data = op.data as Record<string, unknown>
    const finalData = { ...data }
    Object.keys(finalData).forEach(k => {
      if (finalData[k] === '__SERVER_TIMESTAMP__') finalData[k] = fsServerTimestamp()
    })
    const options: SetOptions | undefined = op.merge ? { merge: true } : undefined
    if (options) await fsSetDoc(ref, finalData, options)
    else await fsSetDoc(ref, finalData)
  } else {
    await op.exec(db)
  }
}

async function flushQueue() {
  if (flushing) return
  if (!navigator.onLine) return
  flushing = true
  try {
    for (let i = 0; i < ops.length; ) {
      const op = ops[i]
      try {
        await executeOp(op)
  log('Op success', op.kind, op.kind === 'set' ? op.path : op.note)
        ops.splice(i, 1)
        schedulePersist()
      } catch (e) {
        op.attempts += 1
        if (op.attempts >= MAX_ATTEMPTS || !isRetryable(e)) {
          console.warn('[FirestoreQueue] Dropping op after attempts', op, e)
          ops.splice(i, 1)
          schedulePersist()
          continue
        }
        log('Retry later', op.kind, 'attempt', op.attempts)
        i++
        break // stop batch on first retryable failure
      }
    }
  } finally {
    flushing = false
  }
}

function flushSoon() {
  if (flushing) return
  if (!navigator.onLine) return
  Promise.resolve().then(() => flushQueue())
}

export function enqueueFirestoreOp(op: (db: Firestore) => Promise<void>, note?: string) {
  ensureListeners()
  ops.push({ kind: 'fn', exec: op, ts: Date.now(), attempts: 0, note })
  log('Enqueued fn op', note)
  flushSoon()
}

export function queueSetDoc(path: string, data: unknown, merge?: boolean) {
  ensureListeners()
  ops.push({ kind: 'set', path, data, merge, ts: Date.now(), attempts: 0 })
  log('Enqueued set', path, merge ? '(merge)' : '')
  schedulePersist()
  flushSoon()
}

export function flushFirestoreQueue() { flushSoon() }
export function getFirestoreQueueSize() { return ops.length }
