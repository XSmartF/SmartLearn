

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      lead: "text-muted-foreground text-xl",
      large: "text-lg font-semibold",
      small: "text-sm leading-none font-medium",
      muted: "text-muted-foreground text-sm",
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

export interface TypographyProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
  asChild?: boolean
}

export function Typography({ variant, className, children, ...props }: TypographyProps) {
  let Comp: React.ElementType
  switch (variant) {
    case "h1":
      Comp = "h1"
      break
    case "h2":
      Comp = "h2"
      break
    case "h3":
      Comp = "h3"
      break
    case "h4":
      Comp = "h4"
      break
    case "blockquote":
      Comp = "blockquote"
      break
    case "list":
      Comp = "ul"
      break
    case "lead":
      Comp = "p"
      break
    case "large":
      Comp = "div"
      break
    case "small":
      Comp = "small"
      break
    case "muted":
      Comp = "p"
      break
    default:
      Comp = "p"
  }
  return (
    <Comp className={cn(typographyVariants({ variant, className }))} {...props}>
      {children}
    </Comp>
  )
}
