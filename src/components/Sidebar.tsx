import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2 rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`

export default function Sidebar() {
  return (
    <aside className="w-60 border-r bg-white p-3 space-y-2">
      <NavLink to="/" className={linkClass}>ダッシュボード</NavLink>
      <NavLink to="/documents" className={linkClass}>書類一覧</NavLink>
      <NavLink to="/foreigners" className={linkClass}>特定技能外国人</NavLink>
      <NavLink to="/company" className={linkClass}>会社情報</NavLink>
      <div className="pt-2 text-xs text-gray-500">書類作成</div>
      <NavLink to="/forms/residence-cert" className={linkClass}>在留資格認定証明</NavLink>
      <NavLink to="/forms/period-extension" className={linkClass}>在留期間更新許可</NavLink>
      <NavLink to="/forms/status-change" className={linkClass}>在留資格変更許可</NavLink>
      <NavLink to="/forms/interview-report" className={linkClass}>定期面談報告書</NavLink>
      <NavLink to="/forms/resignation-report" className={linkClass}>退職等随時報告書</NavLink>
    </aside>
  )
}

