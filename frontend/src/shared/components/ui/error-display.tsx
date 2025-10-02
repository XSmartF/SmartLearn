import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface ErrorDisplayProps {
  error?: string | null
  variant?: "error" | "success" | "warning" | "info"
  className?: string
  showIcon?: boolean
}

const variantStyles = {
  error: {
    container: "text-red-600 bg-red-50 border-red-200",
    icon: <XCircle className="w-4 h-4" />
  },
  success: {
    container: "text-green-600 bg-green-50 border-green-200", 
    icon: <CheckCircle className="w-4 h-4" />
  },
  warning: {
    container: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: <AlertTriangle className="w-4 h-4" />
  },
  info: {
    container: "text-blue-600 bg-blue-50 border-blue-200",
    icon: <Info className="w-4 h-4" />
  }
}

export function ErrorDisplay({ 
  error, 
  variant = "error", 
  className,
  showIcon = true 
}: ErrorDisplayProps) {
  if (!error) return null

  const styles = variantStyles[variant]

  return (
    <div className={cn(
      "text-sm p-3 rounded-md border animate-fade-in flex items-start gap-2",
      styles.container,
      className
    )}>
      {showIcon && (
        <span className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </span>
      )}
      <span className="flex-1">{error}</span>
    </div>
  )
}