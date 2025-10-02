import { Outlet } from 'react-router-dom'
import { AppSidebar } from "@/shared/components/app-sidebar"
import { NavActions } from "@/shared/components/nav-actions"
import DynamicBreadcrumb from '@/shared/components/DynamicBreadcrumb'
import { SpeedDial } from '@/shared/components/SpeedDial'
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
      <SidebarInset className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="glass-header z-40 flex h-16 shrink-0 items-center gap-2 px-4 sm:px-6">
          <div className="flex flex-1 items-center gap-3 px-1 sm:px-0">
            <SidebarTrigger className="neu-button h-10 w-10" />
            <Separator
              orientation="vertical"
              className="mr-2 h-6 bg-border/50"
            />
            <DynamicBreadcrumb />
          </div>
          <div className="ml-auto px-1 sm:px-3">
            <NavActions />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="w-full">
              <Outlet />
            </div>
          </div>
        </div>
        <SpeedDial />
      </SidebarInset>
    </SidebarProvider>
  )
}
