import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@context/AuthContext'
import Login from '@pages/Login'
import Dashboard from '@pages/Dashboard'
import DocumentListPage from '@pages/DocumentListPage'
import ForeignerListPage from '@pages/ForeignerListPage'
import CompanyInfoPage from '@pages/CompanyInfoPage'
import ResidenceStatusForm from '@pages/ResidenceStatusForm'
import PeriodExtensionForm from '@pages/PeriodExtensionForm'
import StatusChangeForm from '@pages/StatusChangeForm'
import InterviewReportForm from '@pages/InterviewReportForm'
import ResignationReportForm from '@pages/ResignationReportForm'
import Header from '@components/Header'
import Sidebar from '@components/Sidebar'

function Protected({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function Shell() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<DocumentListPage />} />
            <Route path="/foreigners" element={<ForeignerListPage />} />
            <Route path="/company" element={<CompanyInfoPage />} />
            <Route path="/forms/residence-cert" element={<ResidenceStatusForm />} />
            <Route path="/forms/period-extension" element={<PeriodExtensionForm />} />
            <Route path="/forms/status-change" element={<StatusChangeForm />} />
            <Route path="/forms/interview-report" element={<InterviewReportForm />} />
            <Route path="/forms/resignation-report" element={<ResignationReportForm />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <Protected>
              <Shell />
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

