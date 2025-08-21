export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
export const API_V1 = `${API_BASE_URL}/api/v1`

export async function apiGet<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_V1}${path}`, { cache: 'no-store', ...init })
  if (!res.ok) {
    try {
      const data = await res.json()
      throw new Error(data.detail ?? `HTTP ${res.status}`)
    } catch (e) {
      throw new Error(`HTTP ${res.status}`)
    }
  }
  return res.json()
}

export async function apiJson<T = unknown>(path: string, method: 'POST'|'PUT'|'DELETE', body?: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_V1}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    ...init,
  })
  if (!res.ok) {
    try {
      const data = await res.json()
      throw new Error(data.detail ?? `HTTP ${res.status}`)
    } catch (e) {
      throw new Error(`HTTP ${res.status}`)
    }
  }
  return res.json()
}



