import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/shared/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // Display & layout
        "bg-card text-muted-foreground inline-flex h-10 w-full items-center justify-start rounded-full p-1 gap-1 sm:gap-2",
        // Horizontal scroll for overflow, hide scrollbar, smooth touch
        "overflow-x-auto no-scrollbar whitespace-nowrap scroll-px-2 snap-x snap-mandatory touch-pan-x overscroll-x-contain",
        // Subtle shadow
        "shadow-[var(--neu-shadow-sm)]",
        "dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4),-1px_-1px_6px_rgba(255,255,255,0.02)]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Sizing & layout: content-sized pills that can scroll horizontally
        "inline-flex h-8 flex-none shrink-0 items-center justify-center gap-1.5 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 snap-start",
        // States
        "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        "data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:shadow-sm",
        "dark:data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
        "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
