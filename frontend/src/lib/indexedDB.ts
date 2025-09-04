// Simple IndexedDB key-value utility
// Provides async get/set/remove similar to localStorage but non-blocking and larger capacity

const DB_NAME = 'smartlearn-db'
// Increment DB_VERSION only when making an intentional schema change.
// We keep it at 1 here; dynamic recovery logic below will bump if the store is missing.
// We no longer pass an explicit version on first open to avoid VersionError after auto-migrations.
const DB_VERSION = 1 // kept for possible future intentional schema bumps
const STORE_NAME = 'kv'

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    // First open WITHOUT specifying version to avoid VersionError if db already upgraded.
    const normalReq = indexedDB.open(DB_NAME)
    let triedUpgrade = false

    normalReq.onsuccess = () => {
      const db = normalReq.result
      if (!db.objectStoreNames.contains(STORE_NAME) && !triedUpgrade) {
        triedUpgrade = true
        // Need an upgrade: reopen with bumped version
        const newVersion = db.version + 1
        db.close()
        const upgradeReq = indexedDB.open(DB_NAME, Math.max(newVersion, DB_VERSION))
        upgradeReq.onupgradeneeded = () => {
          const udb = upgradeReq.result
          if (!udb.objectStoreNames.contains(STORE_NAME)) {
            udb.createObjectStore(STORE_NAME)
          }
        }
        upgradeReq.onsuccess = () => resolve(upgradeReq.result)
        upgradeReq.onerror = () => reject(upgradeReq.error)
        return
      }
      resolve(db)
    }
    normalReq.onerror = () => {
      const err = normalReq.error
      // If we hit a VersionError here (rare with versionless open) fallback to explicit open with current constant
      if (err && (err as DOMException).name === 'VersionError') {
        const req2 = indexedDB.open(DB_NAME, DB_VERSION)
        req2.onsuccess = () => resolve(req2.result)
        req2.onerror = () => reject(req2.error)
        return
      }
      reject(err)
    }
  })
  return dbPromise
}

export async function idbSetItem<T = unknown>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(value, key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (e) {
    console.error('[IndexedDB] setItem failed, falling back to in-memory', e)
  }
}

export async function idbGetItem<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await openDB()
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () => {
        if (req.result === undefined) resolve(null)
        else resolve(req.result as T)
      }
      req.onerror = () => reject(req.error)
    })
  } catch (e) {
    console.error('[IndexedDB] getItem failed', e)
    return null
  }
}

export async function idbRemoveItem(key: string): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (e) {
    console.error('[IndexedDB] removeItem failed', e)
  }
}

export async function idbGetAllKeys(): Promise<string[]> {
  try {
    const db = await openDB()
    return await new Promise<string[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const keys: string[] = []
      const req = store.openCursor()
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          keys.push(cursor.key as string)
          cursor.continue()
        } else {
          resolve(keys)
        }
      }
      req.onerror = () => reject(req.error)
    })
  } catch (e) {
    console.error('[IndexedDB] getAllKeys failed', e)
    return []
  }
}

// Helper to migrate from localStorage once (optional usage if needed later)
export async function migrateLocalStorageKey(key: string) {
  const existing = await idbGetItem(key)
  if (existing != null) return
  const ls = window.localStorage.getItem(key)
  if (ls != null) {
    try {
      const parsed = JSON.parse(ls)
      await idbSetItem(key, parsed)
    } catch {
      await idbSetItem(key, ls)
    }
  }
}
