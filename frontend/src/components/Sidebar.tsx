import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Building2,
  ChevronDown,
  ClipboardList,
  FileEdit,
  FileText,
  LayoutDashboard,
  ListChecks,
  Users,
  Plus,
} from 'lucide-react'

import { Button } from '@components/ui/button'
import { cn } from '@lib/utils'

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export const formNavItems: NavItem[] = [
  { label: '在留資格認定証明書', to: '/forms/residence-status', icon: FileText },
  { label: '在留期間更新許可申請', to: '/forms/period-extension', icon: FileEdit },
  { label: '在留資格変更許可申請', to: '/forms/status-change', icon: ClipboardList },
  { label: '定期面談報告書', to: '/forms/interview-report', icon: ListChecks },
  { label: '退職等随時報告書', to: '/forms/resignation-report', icon: Users },
]

export const primaryNavItems: NavItem[] = [
  { label: 'ダッシュボード', to: '/', icon: LayoutDashboard },
  { label: '書類一覧', to: '/documents', icon: FileText },
  { label: '外国人一覧', to: '/foreigners', icon: Users },
  { label: '会社情報', to: '/company', icon: Building2 },
]

function SidebarLink({ to, icon: Icon, label, isActive }: NavItem & { isActive: boolean }) {
  return (
    <NavLink to={to} className="block">
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn('w-full justify-start gap-2 text-sm font-medium', isActive && 'bg-secondary/60')}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    </NavLink>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const [isFormsOpen, setIsFormsOpen] = useState(() => location.pathname.startsWith('/forms/'))

  const handleJobPostingClick = () => {
    window.open('https://ssw-pf.vercel.app/client/login', '_blank')
  }

  return (
    <aside className="hidden border-r bg-card/50 md:flex md:w-64 md:flex-col md:gap-2 md:p-4">
      <div className="space-y-1">
        {primaryNavItems.map((item) => (
          <SidebarLink key={item.to} {...item} isActive={location.pathname === item.to} />
        ))}
      </div>
      <div className="mt-6 space-y-1">
        <button
          type="button"
          onClick={() => setIsFormsOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            書類作成
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isFormsOpen ? 'rotate-180' : '')} />
        </button>
        {isFormsOpen && (
          <div className="ml-2 space-y-1 border-l pl-3">
            {formNavItems.map((item) => (
              <SidebarLink key={item.to} {...item} isActive={location.pathname === item.to} />
            ))}
          </div>
        )}

        {/* 求人を投稿するボタン */}
        <div className="mt-6">
          <Button
            onClick={handleJobPostingClick}
            variant="outline"
            className="w-full justify-start gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            求人を投稿する
          </Button>
        </div>
      </div>
    </aside>
  )
}

