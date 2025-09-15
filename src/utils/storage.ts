export function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getItem<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function removeItem(key: string) {
  localStorage.removeItem(key)
}

