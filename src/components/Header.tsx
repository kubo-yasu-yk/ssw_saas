import { useAuth } from '@context/AuthContext'
import Button from './Button'

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4">
      <h1 className="font-semibold flex items-center gap-2">
        特定技能 在留資格管理モック
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">モック版</span>
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.name}</span>
        <Button variant="secondary" size="sm" onClick={logout}>ログアウト</Button>
      </div>
    </header>
  )
}
