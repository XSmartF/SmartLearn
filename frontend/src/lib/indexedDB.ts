// Simple IndexedDB key-value utility
// Provides async get/set/remove similar to localStorage but non-blocking and larger capacity

const DB_NAME = 'smartlearn-db'
const DB_VERSION = 1
const STORE_NAME = 'kv'

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
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
