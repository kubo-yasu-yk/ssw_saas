import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

import { activities as seedActivities, company as seedCompany, documents as seedDocuments, foreigners as seedForeigners } from '@data/mock'
import type { ActivityLog, Company, Document, DocumentStatus, Foreigner } from '@types/index'
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
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

export const AppStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, initialState)

  useEffect(() => {
    setItem(STORAGE_KEY, state)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])

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

