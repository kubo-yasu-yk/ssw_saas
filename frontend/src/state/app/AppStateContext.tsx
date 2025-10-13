import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { supabase } from '@services/supabase'

import * as activityLogsApi from '@api/activity-logs.service'
import * as companyApi from '@api/company.service'
import * as documentsApi from '@api/documents.service'
import * as foreignersApi from '@api/foreigners.service'
import type { ActivityLog, Company, Document, DocumentStatus, Foreigner } from '@types/index'
import type { ApiError } from '@utils/errorHandler'
import { toApiError } from '@utils/errorHandler'
import { useApiExecutor, type ExecuteOptions } from '@state/shared/apiExecutor'

interface AppState {
  documents: Document[]
  foreigners: Foreigner[]
  company: Company | null
  activities: ActivityLog[]
  isLoaded: boolean
}

type AppAction =
  | { type: 'SET_INITIAL_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT_STATUS'; documentId: string; status: DocumentStatus }
  | { type: 'DELETE_DOCUMENT'; documentId: string }
  | { type: 'ADD_FOREIGNER'; payload: Foreigner }
  | { type: 'UPDATE_FOREIGNER'; payload: Foreigner }
  | { type: 'DELETE_FOREIGNER'; foreignerId: string }
  | { type: 'ADD_ACTIVITY'; payload: ActivityLog }
  | { type: 'UPDATE_COMPANY'; payload: Company }
  | { type: 'RESET_STATE' }

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
  | { type: 'RESET_STATUS' }

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
    case 'RESET_STATUS':
      return { ...initialStatusState }
    default:
      return state
  }
}

const initialState: AppState = {
  documents: [],
  foreigners: [],
  company: null,
  activities: [],
  isLoaded: false,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return {
        ...state,
        ...action.payload,
        isLoaded: true,
      }
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
    case 'DELETE_FOREIGNER':
      return {
        ...state,
        foreigners: state.foreigners.filter((f) => f.id !== action.foreignerId),
      }
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities].slice(0, 20) }
    case 'UPDATE_COMPANY':
      return { ...state, company: action.payload }
    case 'RESET_STATE':
      return { ...initialState }
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
    resetState: () => void
    // Foreigner CRUD
    createForeigner: (foreigner: Omit<Foreigner, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Foreigner>
    updateForeigner: (id: string, updates: Partial<Foreigner>) => Promise<Foreigner>
    deleteForeigner: (id: string) => Promise<void>
    // Document CRUD
    createDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Document>
    updateDocument: (id: string, updates: Partial<Document>) => Promise<Document>
    updateDocumentStatus: (id: string, status: DocumentStatus) => Promise<Document>
    deleteDocument: (id: string) => Promise<void>
    // Company
    updateCompany: (id: string, updates: Partial<Company>) => Promise<Company>
    // Activity
    createActivity: (message: string) => Promise<ActivityLog>
  }
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

export const AppStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const [status, statusDispatch] = useReducer(statusReducer, initialStatusState)

  // 初期データロード
  useEffect(() => {
    let mounted = true

    const loadInitialData = async () => {
      if (state.isLoaded) return
      // 未認証時は初期ロードを行わない
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      statusDispatch({ type: 'START_REQUEST' })
      try {
        const [foreigners, documents, company, activities] = await Promise.all([
          foreignersApi.getForeigners(),
          documentsApi.getDocuments(),
          companyApi.getCompany(),
          activityLogsApi.getActivityLogs(20),
        ])

        if (mounted) {
          dispatch({
            type: 'SET_INITIAL_DATA',
            payload: {
              foreigners,
              documents,
              company,
              activities,
            },
          })
          statusDispatch({ type: 'SET_LAST_SYNCED_AT' })
        }
      } catch (error) {
        console.error('Failed to load initial data:', error)
        if (mounted) {
          const apiError = toApiError(error)
          statusDispatch({ type: 'SET_ERROR', payload: apiError })
        }
      } finally {
        if (mounted) {
          statusDispatch({ type: 'FINISH_REQUEST' })
        }
      }
    }

    // 既にログイン済みなら即ロード
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) loadInitialData()
    })
    // ログイン完了時にロード
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return
      if (event === 'SIGNED_IN') {
        loadInitialData()
      }
      if (event === 'SIGNED_OUT') {
        dispatch({ type: 'RESET_STATE' })
        statusDispatch({ type: 'RESET_STATUS' })
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [state.isLoaded])

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

  const execute = useApiExecutor({ startRequest, finishRequest, setError, markSynced })

  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
    statusDispatch({ type: 'RESET_STATUS' })
  }, [])

  const activeCompanyId = state.company?.id

  // Foreigner CRUD operations
  const createForeignerAction = useCallback(
    async (foreigner: Omit<Foreigner, 'id' | 'createdAt' | 'updatedAt'>) => {
      return execute({
        request: () => foreignersApi.createForeigner(foreigner),
        optimisticUpdate: () => {
          // オプティミスティックUIは省略（IDが必要なため）
        },
        markSynced: true,
      }).then((created) => {
        dispatch({ type: 'ADD_FOREIGNER', payload: created })
        return created
      })
    },
    [execute]
  )

  const updateForeignerAction = useCallback(
    async (id: string, updates: Partial<Foreigner>) => {
      return execute({
        request: () => foreignersApi.updateForeigner(id, updates),
        markSynced: true,
      }).then((updated) => {
        dispatch({ type: 'UPDATE_FOREIGNER', payload: updated })
        return updated
      })
    },
    [execute]
  )

  const deleteForeignerAction = useCallback(
    async (id: string) => {
      return execute({
        request: () => foreignersApi.deleteForeigner(id),
        optimisticUpdate: () => {
          dispatch({ type: 'DELETE_FOREIGNER', foreignerId: id })
        },
        rollback: async () => {
          // ロールバックが必要な場合は再取得
          const foreigners = await foreignersApi.getForeigners()
          dispatch({ type: 'SET_INITIAL_DATA', payload: { foreigners } })
        },
        markSynced: true,
      })
    },
    [execute]
  )

  // Document CRUD operations
  const createDocumentAction = useCallback(
    async (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
      return execute({
        request: () => documentsApi.createDocument(document),
        markSynced: true,
      }).then((created) => {
        dispatch({ type: 'ADD_DOCUMENT', payload: created })
        return created
      })
    },
    [execute]
  )

  const updateDocumentAction = useCallback(
    async (id: string, updates: Partial<Document>) => {
      return execute({
        request: () => documentsApi.updateDocument(id, updates),
        markSynced: true,
      }).then((updated) => {
        dispatch({ type: 'UPDATE_DOCUMENT', payload: updated })
        return updated
      })
    },
    [execute]
  )

  const updateDocumentStatusAction = useCallback(
    async (id: string, status: DocumentStatus) => {
      return execute({
        request: () => documentsApi.updateDocumentStatus(id, status),
        optimisticUpdate: () => {
          dispatch({ type: 'UPDATE_DOCUMENT_STATUS', documentId: id, status })
        },
        markSynced: true,
      }).then((updated) => {
        dispatch({ type: 'UPDATE_DOCUMENT', payload: updated })
        return updated
      })
    },
    [execute]
  )

  const deleteDocumentAction = useCallback(
    async (id: string) => {
      return execute({
        request: () => documentsApi.deleteDocument(id),
        optimisticUpdate: () => {
          dispatch({ type: 'DELETE_DOCUMENT', documentId: id })
        },
        rollback: async () => {
          const documents = await documentsApi.getDocuments()
          dispatch({ type: 'SET_INITIAL_DATA', payload: { documents } })
        },
        markSynced: true,
      })
    },
    [execute]
  )

  // Company operations
  const updateCompanyAction = useCallback(
    async (id: string, updates: Partial<Company>) => {
      return execute({
        request: () => companyApi.updateCompany(id, updates),
        markSynced: true,
      }).then((updated) => {
        dispatch({ type: 'UPDATE_COMPANY', payload: updated })
        return updated
      })
    },
    [execute]
  )

  // Activity operations
  const createActivityAction = useCallback(
    async (message: string) => {
      if (!activeCompanyId) {
        throw new Error('会社情報が読み込まれていないため、アクティビティログを作成できません。')
      }
      return execute({
        request: () => activityLogsApi.createActivityLog({ message, companyId: activeCompanyId }),
        markSynced: true,
      }).then((created) => {
        dispatch({ type: 'ADD_ACTIVITY', payload: created })
        return created
      })
    },
    [activeCompanyId, dispatch, execute]
  )

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
        resetState,
        createForeigner: createForeignerAction,
        updateForeigner: updateForeignerAction,
        deleteForeigner: deleteForeignerAction,
        createDocument: createDocumentAction,
        updateDocument: updateDocumentAction,
        updateDocumentStatus: updateDocumentStatusAction,
        deleteDocument: deleteDocumentAction,
        updateCompany: updateCompanyAction,
        createActivity: createActivityAction,
      },
    }),
    [
      state,
      status,
      setError,
      clearError,
      startRequest,
      finishRequest,
      markSynced,
      execute,
      resetState,
      createForeignerAction,
      updateForeignerAction,
      deleteForeignerAction,
      createDocumentAction,
      updateDocumentAction,
      updateDocumentStatusAction,
      deleteDocumentAction,
      updateCompanyAction,
      createActivityAction,
    ]
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
