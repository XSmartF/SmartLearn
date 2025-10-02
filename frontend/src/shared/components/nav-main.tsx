import { type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { cn } from "@/shared/lib/utils"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    match?: (pathname: string) => boolean
    badge?: number
    dataAttr?: Record<string, string>
  }[]
}) {
  const location = useLocation()

  const isActive = (item: {
    url: string
    isActive?: boolean
    match?: (pathname: string) => boolean
  }) => {
    if (item.match) return item.match(location.pathname)
    if (location.pathname === item.url) return true
    if (location.pathname.startsWith(item.url + "/")) return true
    return false
  }

  return (
    <SidebarMenu className="gap-2">
      {items.map((item) => {
        const active = isActive(item)
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={active} className="h-auto p-0">
              <Link 
                to={item.url}
                {...(item.dataAttr || {})}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 relative min-h-[40px]",
                  active && "bg-primary/10 text-primary shadow-[var(--neu-shadow-sm)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-1px_-1px_4px_rgba(255,255,255,0.03)]",
                  !active && "hover:bg-sidebar-accent/50"
                )}
              >
                {/* Active Indicator - chỉ hiện khi active */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-r-full" />
                )}

                {/* Icon Container */}
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0",
                  active 
                    ? "bg-gradient-to-br from-primary to-accent text-white shadow-[var(--neu-shadow-sm)]" 
                    : "bg-sidebar-accent/50 text-muted-foreground group-hover:bg-sidebar-accent group-hover:text-foreground"
                )}>
                  <item.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>

                {/* Text */}
                <span className={cn(
                  "flex-1 min-w-0 font-medium text-sm transition-colors truncate",
                  active ? "text-primary font-semibold" : "text-foreground group-hover:text-primary"
                )}>
                  {item.title}
                </span>

                {/* Badge */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="shrink-0 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-gradient-to-br from-destructive to-destructive/80 text-white px-2 py-0.5 min-w-[20px] shadow-[var(--neu-shadow-sm)] animate-pulse-soft">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
