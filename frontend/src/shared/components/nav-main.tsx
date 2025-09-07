import { type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    // optional custom matcher (path => boolean)
    match?: (pathname: string) => boolean
  badge?: number
  }[]
}) {
  const location = useLocation()

  const isActive = (item: {
    url: string
    isActive?: boolean
    match?: (pathname: string) => boolean
  }) => {
    if (item.match) return item.match(location.pathname)
    // Exact match or nested route under the item's URL
    if (location.pathname === item.url) return true
    if (location.pathname.startsWith(item.url + "/")) return true
    return false
  }
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item)}>
            <Link to={item.url}>
              <item.icon />
              <span className="flex items-center gap-1 sm:gap-2">
                {item.title}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center text-[9px] sm:text-[10px] font-medium rounded-full bg-red-500 text-white px-1 sm:px-1.5 py-0.5 min-w-[16px] sm:min-w-[18px]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
