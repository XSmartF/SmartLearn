"use client"
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/shared/lib/utils"

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  label?: string
}

export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("flex items-center gap-2 cursor-pointer select-none", className)}>
        <SwitchPrimitives.Root
          className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted shadow-[var(--neu-shadow-sm)]",
            "dark:data-[state=unchecked]:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),inset_-1px_-1px_4px_rgba(255,255,255,0.03)]"
          )}
          {...props}
          ref={ref}
        >
          <SwitchPrimitives.Thumb
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[var(--neu-shadow-sm)] ring-0 transition-transform",
              "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            )}
          />
        </SwitchPrimitives.Root>
        {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      </label>
    )
  }
)
Switch.displayName = "Switch"
