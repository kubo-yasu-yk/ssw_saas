import { Link, NavLink, useLocation } from 'react-router-dom'
import { LogOut, Menu, UserCircle2 } from 'lucide-react'

import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@components/ui/sheet'
import { useAuth } from '@context/AuthContext'

import { formNavItems, primaryNavItems } from './Sidebar'

function MobileNav() {
  const location = useLocation()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">メニューを開く</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-left text-base font-semibold">メニュー</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 space-y-1">
          {primaryNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="block">
              <Button
                variant={location.pathname === item.to ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2 text-sm"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </NavLink>
          ))}
        </nav>
        <div className="mt-6">
          <p className="px-2 text-xs font-semibold text-muted-foreground">書類作成</p>
          <div className="mt-2 space-y-1">
            {formNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="block">
                <Button
                  variant={location.pathname === item.to ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2 text-sm"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </NavLink>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const pageTitle = (() => {
    if (location.pathname.startsWith('/forms/')) return '書類作成'
    if (location.pathname.startsWith('/documents')) return '書類一覧'
    if (location.pathname.startsWith('/foreigners')) return '特定技能外国人一覧'
    if (location.pathname.startsWith('/company')) return '会社情報'
    return 'ダッシュボード'
  })()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link to="/" className="hidden text-lg font-semibold tracking-tight md:inline-flex">
          特定技能在留資格管理SaaS
        </Link>
        <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground md:inline-flex">
          モック版
        </span>
        <span className="text-sm font-semibold md:hidden">{pageTitle}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground md:inline-flex">{pageTitle}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <UserCircle2 className="h-5 w-5" />
              <span className="hidden text-sm font-medium md:inline-flex">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

