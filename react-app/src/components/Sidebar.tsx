import { Home, FolderKanban, Calculator, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link, useLocation } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Calculations', href: '/calculations', icon: Calculator },
  { name: 'Files / DWG', href: '/files', icon: FileText },
]

interface SidebarProps {
  user: { name: string; email: string; role: string } | null
}

export function Sidebar({ user }: SidebarProps) {
  const location = useLocation()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
          <span className="text-sm font-bold text-white">MEP</span>
        </div>
        <span className="text-lg font-semibold text-foreground">MEP FLOW DESIGNER</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-background-hover text-foreground"
                  : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-background-hover transition-colors"
        >
          <Settings className="h-5 w-5 text-foreground-muted" />
          <span className="text-sm font-medium text-foreground-muted">Settings</span>
        </Link>
        
        {user && (
          <div className="mt-2 flex items-center gap-3 rounded-md bg-background-card px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-foreground-muted uppercase">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
