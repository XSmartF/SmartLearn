import * as React from "react"
import { cn } from "@/shared/lib/utils"

interface IllustrationIconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  variant?: "primary" | "success" | "warning" | "info" | "accent"
  size?: "sm" | "md" | "lg"
}

const variantStyles = {
  primary: "from-primary to-accent",
  success: "from-success to-success/70",
  warning: "from-warning to-warning/70",
  info: "from-info to-info/70",
  accent: "from-accent to-primary",
}

const sizeStyles = {
  sm: "w-10 h-10 rounded-lg",
  md: "w-14 h-14 rounded-lg",
  lg: "w-20 h-20 rounded-3xl",
}

export const IllustrationIcon = React.forwardRef<HTMLDivElement, IllustrationIconProps>(
  ({ icon, variant = "primary", size = "md", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br shadow-[var(--neu-shadow-sm)] transition-all duration-300 hover:shadow-[var(--neu-shadow)] hover:scale-105",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <div className="text-white drop-shadow-sm">
          {icon}
        </div>
      </div>
    )
  }
)

IllustrationIcon.displayName = "IllustrationIcon"
