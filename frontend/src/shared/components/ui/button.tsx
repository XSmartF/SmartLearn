import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:brightness-110 active:scale-98",
        destructive:
          "bg-destructive text-white hover:brightness-110 active:scale-98",
        outline:
          "border-2 border-border bg-card hover:shadow-[var(--neu-shadow-sm)] active:shadow-[var(--neu-shadow-inset)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:brightness-105 active:scale-98",
        warning:
          "bg-warning text-warning-foreground hover:brightness-110 active:scale-98",
        success:
          "bg-success text-success-foreground hover:brightness-110 active:scale-98",
        info:
          "bg-info text-info-foreground hover:brightness-110 active:scale-98",
        ghost:
          "hover:bg-accent/50 hover:shadow-[var(--neu-shadow-sm)] active:shadow-[var(--neu-shadow-inset)]",
        link: "text-primary underline-offset-4 hover:underline hover:brightness-110",
        neu:
          "bg-card shadow-[var(--neu-shadow-sm)] hover:shadow-[var(--neu-shadow)] active:shadow-[var(--neu-shadow-inset)]",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-lg gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-8 text-base has-[>svg]:px-6",
        icon: "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }
