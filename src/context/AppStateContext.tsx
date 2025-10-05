import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'

import { activities as seedActivities, company as seedCompany, documents as seedDocuments, foreigners as seedForeigners } from '@data/mock'
import type { ActivityLog, Company, Document, DocumentStatus, Foreigner } from '@types/index'
import { ApiError, notifyApiError, toApiError } from '@utils/errorHandler'
import { getItem, setItem } from '@utils/storage'

const STORAGE_KEY = 'ssw:app-state'

interface AppState {
  documents: Document[]
  foreigners: Foreigner[]
  company: Company
  activities: ActivityLog[]
}

type AppAction =
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT_STATUS'; documentId: string; status: DocumentStatus }
  | { type: 'DELETE_DOCUMENT'; documentId: string }
  | { type: 'ADD_FOREIGNER'; payload: Foreigner }
  | { type: 'UPDATE_FOREIGNER'; payload: Foreigner }
  | { type: 'ADD_ACTIVITY'; payload: ActivityLog }
  | { type: 'UPDATE_COMPANY'; payload: Company }

type NetworkStatus = 'online' | 'offline' | 'unknown'

interface AppStatusState {
  isLoading: boolean
  error: ApiError | null
  networkStatus: NetworkStatus
  pendingRequests: number
  lastSyncedAt?: string
}

type AppStatusAction =
  | { type: 'START_REQUEST' }
  | { type: 'FINISH_REQUEST' }
  | { type: 'SET_ERROR'; payload: ApiError | null }
  | { type: 'SET_NETWORK_STATUS'; payload: NetworkStatus }
  | { type: 'SET_LAST_SYNCED_AT'; payload?: string }

const getInitialNetworkStatus = (): NetworkStatus => {
  if (typeof navigator === 'undefined') return 'unknown'
  return navigator.onLine ? 'online' : 'offline'
}

const initialStatusState: AppStatusState = {
  isLoading: false,
  error: null,
  networkStatus: getInitialNetworkStatus(),
  pendingRequests: 0,
  lastSyncedAt: undefined,
}

function statusReducer(state: AppStatusState, action: AppStatusAction): AppStatusState {
  switch (action.type) {
    case 'START_REQUEST': {
      const pendingRequests = state.pendingRequests + 1
      return {
        ...state,
        pendingRequests,
        isLoading: true,
      }
    }
    case 'FINISH_REQUEST': {
      const pendingRequests = Math.max(0, state.pendingRequests - 1)
      return {
        ...state,
        pendingRequests,
        isLoading: pendingRequests > 0,
      }
    }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }
    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        networkStatus: action.payload,
      }
    case 'SET_LAST_SYNCED_AT':
      return {
        ...state,
        lastSyncedAt: action.payload ?? new Date().toISOString(),
      }
    default:
      return state
  }
}

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const initialState = (): AppState => {
  const stored = getItem<AppState>(STORAGE_KEY)
  if (stored) {
    return stored
  }
  return {
    documents: cloneState(seedDocuments),
    foreigners: cloneState(seedForeigners),
    company: cloneState(seedCompany),
    activities: cloneState(seedActivities),
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_DOCUMENT':
      return { ...state, documents: [action.payload, ...state.documents] }
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((doc) => (doc.id === action.payload.id ? action.payload : doc)),
      }
    case 'UPDATE_DOCUMENT_STATUS':
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.documentId ? { ...doc, status: action.status, updatedAt: new Date().toISOString() } : doc
        ),
      }
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter((doc) => doc.id !== action.documentId),
      }
    case 'ADD_FOREIGNER':
      return { ...state, foreigners: [action.payload, ...state.foreigners] }
    case 'UPDATE_FOREIGNER':
      return {
        ...state,
        foreigners: state.foreigners.map((f) => (f.id === action.payload.id ? action.payload : f)),
      }
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities].slice(0, 20) }
    case 'UPDATE_COMPANY':
      return { ...state, company: action.payload }
    default:
      return state
  }
}

interface AppStateContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  status: AppStatusState
  actions: {
    setError: (error: ApiError | null) => void
    clearError: () => void
    startRequest: () => void
    finishRequest: () => void
    markSynced: (timestamp?: string) => void
    execute: <T>(options: ExecuteOptions<T>) => Promise<T>
  }
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

interface ExecuteOptions<T> {
  request: () => Promise<T>
  optimisticUpdate?: () => void
  rollback?: () => void | Promise<void>
  markSynced?: boolean
  onError?: (error: ApiError) => void
}

export const AppStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, initialState)
  const [status, statusDispatch] = useReducer(statusReducer, initialStatusState)

  useEffect(() => {
    setItem(STORAGE_KEY, state)
  }, [state])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => statusDispatch({ type: 'SET_NETWORK_STATUS', payload: 'online' })
    const handleOffline = () => statusDispatch({ type: 'SET_NETWORK_STATUS', payload: 'offline' })

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const setError = useCallback((error: ApiError | null) => {
    statusDispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const startRequest = useCallback(() => {
    statusDispatch({ type: 'START_REQUEST' })
    statusDispatch({ type: 'SET_ERROR', payload: null })
  }, [])

  const finishRequest = useCallback(() => {
    statusDispatch({ type: 'FINISH_REQUEST' })
  }, [])

  const markSynced = useCallback((timestamp?: string) => {
    statusDispatch({ type: 'SET_LAST_SYNCED_AT', payload: timestamp })
  }, [])

  const execute = useCallback(
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

  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      status,
      actions: {
        setError,
        clearError,
        startRequest,
        finishRequest,
        markSynced,
        execute,
      },
    }),
    [dispatch, execute, finishRequest, markSynced, setError, startRequest, state, status]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context.state
}

export function useAppDispatch() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppDispatch must be used within AppStateProvider')
  }
  return context.dispatch
}

export function useAppStatus() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppStatus must be used within AppStateProvider')
  }
  return context.status
}

export function useAppActions() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppActions must be used within AppStateProvider')
  }
  return context.actions
}
