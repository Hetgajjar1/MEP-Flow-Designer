import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'active' | 'on-hold' | 'completed' | 'dwg' | 'pdf'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          'bg-background-card border-border text-foreground': variant === 'default',
          'bg-accent-green/20 border-accent-green text-accent-green': variant === 'active',
          'bg-accent-yellow/20 border-accent-yellow text-accent-yellow': variant === 'on-hold',
          'bg-blue-500/20 border-blue-500 text-blue-400': variant === 'completed',
          'bg-primary/20 border-primary text-primary': variant === 'dwg',
          'bg-accent-red/20 border-accent-red text-accent-red': variant === 'pdf',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
