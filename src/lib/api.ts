import type { ApiErrorShape, PaginatedResponse, PaginationParams } from '@types/index'
import { ApiError, toApiError } from '@utils/errorHandler'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type QueryValue = string | number | boolean | undefined | null

type QueryParams = Record<string, QueryValue | QueryValue[]>

export interface ApiClientOptions {
  baseURL?: string
  timeoutMs?: number
  retry?: number
  retryDelayMs?: number
  defaultHeaders?: Record<string, string>
  fetchImplementation?: typeof fetch
  onUnauthorized?: () => void | Promise<void>
}

export interface RequestOptions<TRequest = unknown> {
  method?: HttpMethod
  query?: QueryParams
  body?: TRequest
  headers?: Record<string, string>
  timeoutMs?: number
  retry?: number
  signal?: AbortSignal
  skipAuth?: boolean
}

const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_RETRY_COUNT = 1
const DEFAULT_RETRY_DELAY_MS = 500

function buildQueryString(params?: QueryParams): string {
  if (!params) return ''

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v === undefined || v === null) return
        searchParams.append(key, String(v))
      })
      return
    }
    searchParams.append(key, String(value))
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const resolveBaseURL = () => {
  const fromEnv =
    (import.meta as unknown as { env: Record<string, string | undefined> }).env?.REACT_APP_API_URL ??
    (import.meta as unknown as { env: Record<string, string | undefined> }).env?.VITE_API_URL

  return fromEnv ?? ''
}

export class ApiClient {
  private readonly baseURL: string
  private readonly defaultHeaders: Record<string, string>
  private readonly fetchImplementation: typeof fetch
  private readonly onUnauthorized?: () => void | Promise<void>
  private timeoutMs: number
  private retry: number
  private retryDelayMs: number
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL ?? resolveBaseURL()
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    this.retry = options.retry ?? DEFAULT_RETRY_COUNT
    this.retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS
    this.defaultHeaders = options.defaultHeaders ?? { 'Content-Type': 'application/json' }
    this.fetchImplementation = options.fetchImplementation ?? fetch
    this.onUnauthorized = options.onUnauthorized
  }

  setTokens(tokens: { accessToken?: string | null; refreshToken?: string | null }) {
    if (typeof tokens.accessToken !== 'undefined') {
      this.accessToken = tokens.accessToken
    }
    if (typeof tokens.refreshToken !== 'undefined') {
      this.refreshToken = tokens.refreshToken
    }
  }

  clearTokens() {
    this.accessToken = null
    this.refreshToken = null
  }

  getAccessToken() {
    return this.accessToken
  }

  getRefreshToken() {
    return this.refreshToken
  }

  setTimeout(timeoutMs: number) {
    this.timeoutMs = timeoutMs
  }

  setRetry({ retry, retryDelayMs }: { retry?: number; retryDelayMs?: number }) {
    if (typeof retry === 'number') this.retry = retry
    if (typeof retryDelayMs === 'number') this.retryDelayMs = retryDelayMs
  }

  async get<TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<TResponse>(path, { ...options, method: 'GET' })
  }

  async getList<TResponse>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<PaginatedResponse<TResponse>>(path, { ...options, method: 'GET' })
  }

  async post<TResponse, TRequest = unknown>(path: string, options?: RequestOptions<TRequest>) {
    return this.request<TResponse, TRequest>(path, { ...options, method: 'POST' })
  }

  async put<TResponse, TRequest = unknown>(path: string, options?: RequestOptions<TRequest>) {
    return this.request<TResponse, TRequest>(path, { ...options, method: 'PUT' })
  }

  async patch<TResponse, TRequest = unknown>(path: string, options?: RequestOptions<TRequest>) {
    return this.request<TResponse, TRequest>(path, { ...options, method: 'PATCH' })
  }

  async delete<TResponse = void>(path: string, options?: Omit<RequestOptions, 'body'>) {
    return this.request<TResponse>(path, { ...options, method: 'DELETE' })
  }

  private prepareHeaders(headers?: Record<string, string>, skipAuth?: boolean) {
    const merged = { ...this.defaultHeaders, ...headers }
    if (!skipAuth && this.accessToken) {
      merged.Authorization = `Bearer ${this.accessToken}`
    }
    return merged
  }

  private composeURL(path: string, query?: QueryParams) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const queryString = buildQueryString(query)
    if (!this.baseURL) {
      return `${normalizedPath}${queryString}`
    }
    return `${this.baseURL.replace(/\/$/, '')}${normalizedPath}${queryString}`
  }

  private createAbortController(signal?: AbortSignal, timeoutMs?: number) {
    const controller = new AbortController()
    const timeout = timeoutMs ?? this.timeoutMs
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    if (signal) {
      if (signal.aborted) {
        controller.abort()
      } else {
        signal.addEventListener('abort', () => controller.abort(), { once: true })
      }
    }

    return { controller, timeoutId }
  }

  private async parseError(response: Response): Promise<ApiError> {
    let payload: ApiErrorShape | undefined
    try {
      payload = await response.clone().json()
    } catch (error) {
      // ignore JSON parse errors; fall back to basic shape
    }
    return new ApiError({
      status: response.status,
      code: payload?.code,
      message: payload?.message ?? response.statusText,
      errors: payload?.errors,
      details: payload?.details,
    })
  }

  private shouldRetry(response: Response | undefined, error: unknown, attempt: number, maxRetry: number) {
    if (attempt >= maxRetry) return false
    if (response) {
      return response.status >= 500 && response.status !== 501
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return true
    }
    return true
  }

  async request<TResponse, TRequest = unknown>(path: string, options: RequestOptions<TRequest> = {}) {
    const { method = 'GET', query, body, headers, timeoutMs, retry, signal, skipAuth } = options
    const url = this.composeURL(path, query)
    const maxRetry = retry ?? this.retry

    let attempt = 0
    let lastError: unknown

    while (attempt <= maxRetry) {
      const { controller, timeoutId } = this.createAbortController(signal, timeoutMs)
      try {
        const init: RequestInit = {
          method,
          headers: this.prepareHeaders(headers, skipAuth),
          signal: controller.signal,
        }

        if (body instanceof FormData || body instanceof URLSearchParams) {
          init.body = body
        } else if (body !== undefined && body !== null) {
          init.body = JSON.stringify(body)
        }

        const response = await this.fetchImplementation(url, init)

        if (response.status === 401 && this.onUnauthorized) {
          await this.onUnauthorized()
        }

        if (!response.ok) {
          if (this.shouldRetry(response, undefined, attempt, maxRetry)) {
            attempt += 1
            await delay(this.retryDelayMs)
            continue
          }
          throw await this.parseError(response)
        }

        if (response.status === 204) {
          clearTimeout(timeoutId)
          return undefined as TResponse
        }

        const contentType = response.headers.get('Content-Type') ?? ''
        if (contentType.includes('application/json')) {
          const data = (await response.json()) as TResponse
          clearTimeout(timeoutId)
          return data
        }

        const data = (await response.text()) as unknown as TResponse
        clearTimeout(timeoutId)
        return data
      } catch (error) {
        clearTimeout(timeoutId)
        lastError = error
        if (error instanceof ApiError) {
          throw error
        }
        if (!this.shouldRetry(undefined, error, attempt, maxRetry)) {
          throw toApiError(error)
        }
        attempt += 1
        await delay(this.retryDelayMs)
      }
    }

    throw toApiError(lastError)
  }

  async fetchPaginated<T>(path: string, params?: PaginationParams & QueryParams) {
    return this.request<PaginatedResponse<T>>(path, { method: 'GET', query: params })
  }
}

export const apiClient = new ApiClient()
