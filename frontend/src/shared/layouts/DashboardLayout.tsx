import { Outlet } from 'react-router-dom'
import { AppSidebar } from "@/shared/components/app-sidebar"
import { NavActions } from "@/shared/components/nav-actions"
import DynamicBreadcrumb from '@/shared/components/DynamicBreadcrumb'
import { Separator } from "@/shared/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar"

export default function DashboardLayout() {
  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 px-4 py-6">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
        </SidebarInset>
      </SidebarProvider>
  )
}
