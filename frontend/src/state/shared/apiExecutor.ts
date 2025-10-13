import { useCallback } from 'react'

import type { ApiError } from '@utils/errorHandler'
import { notifyApiError, toApiError } from '@utils/errorHandler'

export interface ExecuteOptions<T> {
  request: () => Promise<T>
  optimisticUpdate?: () => void
  rollback?: () => void | Promise<void>
  markSynced?: boolean
  onError?: (error: ApiError) => void
}

interface UseApiExecutorParams {
  startRequest: () => void
  finishRequest: () => void
  setError: (error: ApiError | null) => void
  markSynced: (timestamp?: string) => void
}

export function useApiExecutor({ startRequest, finishRequest, setError, markSynced }: UseApiExecutorParams) {
  return useCallback(
    async <T,>({ request, optimisticUpdate, rollback, markSynced: shouldMarkSynced = true, onError }: ExecuteOptions<T>) => {
      startRequest()
      try {
        if (optimisticUpdate) {
          optimisticUpdate()
        }
        const result = await request()
        if (shouldMarkSynced) {
          markSynced()
        }
        return result
      } catch (error) {
        if (rollback) {
          await Promise.resolve(rollback())
        }
        const apiError = toApiError(error)
        setError(apiError)
        if (onError) {
          onError(apiError)
        } else {
          notifyApiError(apiError)
        }
        throw apiError
      } finally {
        finishRequest()
      }
    },
    [finishRequest, markSynced, setError, startRequest]
  )
}
