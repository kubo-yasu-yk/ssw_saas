import type { ApiErrorShape, ValidationError } from '@types/index'
import { toast } from '@components/ui/use-toast'

export class ApiError extends Error implements ApiErrorShape {
  status: number
  code?: string
  errors?: ValidationError[]
  details?: Record<string, unknown>
  cause?: unknown

  constructor(params: ApiErrorShape & { cause?: unknown }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status
    this.code = params.code
    this.errors = params.errors
    this.details = params.details
    this.cause = params.cause
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function toApiError(error: unknown, fallbackMessage = 'ネットワークエラーが発生しました。再度お試しください。'): ApiError {
  if (isApiError(error)) {
    return error
  }

  if (error && typeof error === 'object') {
    const candidate = error as Partial<ApiErrorShape> & { message?: string }
    if (typeof candidate.status === 'number' && typeof candidate.message === 'string') {
      return new ApiError({
        status: candidate.status,
        message: candidate.message,
        code: candidate.code,
        errors: candidate.errors,
        details: candidate.details,
        cause: error,
      })
    }
  }

  if (error instanceof Error) {
    return new ApiError({
      status: 0,
      message: error.message || fallbackMessage,
      cause: error,
    })
  }

  return new ApiError({
    status: 0,
    message: fallbackMessage,
    cause: error,
  })
}

export function extractErrorMessage(error: unknown) {
  if (isApiError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return '予期しないエラーが発生しました。'
}

export function formatValidationErrors(errors?: ValidationError[]) {
  if (!errors || errors.length === 0) {
    return null
  }

  return errors
    .map((error) => `${error.field}: ${error.message}`)
    .join('\n')
}

interface NotifyApiErrorOptions {
  title?: string
  fallbackMessage?: string
  variant?: 'default' | 'destructive'
  includeFieldErrors?: boolean
}

export function notifyApiError(error: unknown, options: NotifyApiErrorOptions = {}) {
  const { title = 'エラーが発生しました', fallbackMessage, variant = 'destructive', includeFieldErrors = true } = options
  const apiError = toApiError(error, fallbackMessage)
  const fieldMessages = includeFieldErrors ? formatValidationErrors(apiError.errors) : null

  toast({
    title,
    description: fieldMessages ? `${apiError.message}\n${fieldMessages}` : apiError.message,
    variant,
  })

  return apiError
}

export function handleErrorWithToast(error: unknown, options?: NotifyApiErrorOptions) {
  return notifyApiError(error, options)
}
