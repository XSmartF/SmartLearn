import * as React from "react"

import { cn } from "@/shared/lib/utils"

type InputProps = React.ComponentProps<"input">

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border/50 flex h-11 w-full min-w-0 rounded-md border bg-input/50 px-4 py-3 text-base shadow-[var(--neu-shadow-inset)] transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm backdrop-blur-sm",
          "focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-2 focus:shadow-[var(--neu-shadow-sm)]",
          "hover:border-primary/50",
          "dark:border-white/10 dark:bg-input dark:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(255,255,255,0.04)]",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
