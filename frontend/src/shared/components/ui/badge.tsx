import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 shadow-[var(--neu-shadow-sm)] hover:shadow-[var(--neu-shadow)]",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20",
        secondary:
          "bg-secondary/10 text-secondary-foreground border border-secondary/20",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20",
        warning:
          "bg-warning/10 text-warning-foreground border border-warning/20",
        success:
          "bg-success/10 text-success border border-success/20",
        info:
          "bg-info/10 text-info border border-info/20",
        outline:
          "bg-card text-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge }
