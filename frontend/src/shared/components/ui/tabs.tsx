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
        "bg-card text-muted-foreground inline-flex h-10 w-fit items-center justify-center rounded-md p-1 gap-1 shadow-[var(--neu-shadow-sm)]",
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
        "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "text-muted-foreground hover:text-foreground",
        "data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-[var(--neu-shadow-sm)]",
        "dark:data-[state=active]:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-1px_-1px_4px_rgba(255,255,255,0.03)]",
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
