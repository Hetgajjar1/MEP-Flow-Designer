import { Search, Bell } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface TopBarProps {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border/50 bg-gradient-to-r from-background via-background-card to-background px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-foreground-muted font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted pointer-events-none" />
          <Input
            placeholder="Search projects, calculations, files..."
            className="pl-10 h-10 bg-background-card/50 border-border/50 focus:border-primary focus:bg-background-card transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="hover:bg-background-hover transition-all duration-200 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-accent-green rounded-full animate-pulse" />
          </Button>
        </div>
      </div>
    </div>
  )
}
