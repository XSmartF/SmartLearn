// Suspense-friendly resource wrapper (simple)
// Usage: const resource = createResource(() => fetchData()); resource.read(); inside Suspense boundary.

export interface Resource<T> { read(): T }

export function createResource<T>(loader: () => Promise<T>): Resource<T> {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: unknown;
  const suspender = loader().then(r => { status = 'success'; result = r; }, e => { status = 'error'; error = e; });
  return {
    read(): T {
      if (status === 'pending') throw suspender;
      if (status === 'error') throw error;
      return result!;
    }
  };
}
