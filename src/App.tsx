import { Navigate, Route, Routes } from 'react-router-dom'

import Header from '@components/Header'
import Sidebar from '@components/Sidebar'
import { Toaster } from '@components/ui/toaster'
import { AuthProvider, useAuth } from '@context/AuthContext'
import { AppStateProvider } from '@context/AppStateContext'
import CompanyInfoPage from '@pages/CompanyInfoPage'
import Dashboard from '@pages/Dashboard'
import DocumentListPage from '@pages/DocumentListPage'
import ForeignerListPage from '@pages/ForeignerListPage'
import InterviewReportForm from '@pages/InterviewReportForm'
import LoginPage from '@pages/Login'
import PeriodExtensionForm from '@pages/PeriodExtensionForm'
import ResidenceStatusForm from '@pages/ResidenceStatusForm'
import ResignationReportForm from '@pages/ResignationReportForm'
import StatusChangeForm from '@pages/StatusChangeForm'

function Protected({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function Shell() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="space-y-6 p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/documents" element={<DocumentListPage />} />
              <Route path="/foreigners" element={<ForeignerListPage />} />
              <Route path="/company" element={<CompanyInfoPage />} />
              <Route path="/forms/residence-status" element={<ResidenceStatusForm />} />
              <Route path="/forms/period-extension" element={<PeriodExtensionForm />} />
              <Route path="/forms/status-change" element={<StatusChangeForm />} />
              <Route path="/forms/interview-report" element={<InterviewReportForm />} />
              <Route path="/forms/resignation-report" element={<ResignationReportForm />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <Protected>
                <Shell />
              </Protected>
            }
          />
        </Routes>
        <Toaster />
      </AppStateProvider>
    </AuthProvider>
  )
}

