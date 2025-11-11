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
    <div className="flex h-screen w-64 flex-col border-r border-border/50 bg-gradient-to-b from-background to-background-card shadow-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-6 bg-background-card/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent-green shadow-lg shadow-primary/30">
          <span className="text-base font-black text-white">M</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground tracking-tight">MEP FLOW</span>
          <span className="text-xs text-foreground-muted">Designer</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 text-foreground shadow-md border border-primary/30"
                  : "text-foreground-muted hover:bg-background-hover hover:text-foreground hover:border hover:border-border/50"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive ? "text-primary" : "text-foreground-muted group-hover:text-foreground group-hover:scale-110"
              )} />
              <span className={isActive ? "font-semibold" : ""}>{item.name}</span>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border/50 p-4 bg-background-card/30">
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-background-hover transition-all duration-200 group mb-3"
        >
          <Settings className="h-5 w-5 text-foreground-muted group-hover:text-foreground group-hover:rotate-90 transition-all duration-300" />
          <span className="text-sm font-medium text-foreground-muted group-hover:text-foreground">Settings</span>
        </Link>
        
        {user && (
          <div className="flex items-center gap-3 rounded-lg bg-gradient-to-br from-background-card to-background-hover px-3 py-3 border border-border/30 shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-green text-white font-bold text-base shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-foreground-muted uppercase tracking-wide font-medium">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
