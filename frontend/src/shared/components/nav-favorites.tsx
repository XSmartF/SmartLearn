"use client"

import {
  ArrowUpRight,
  Link as LinkIcon,
  MoreHorizontal,
  StarOff,
  Folder,
  BookOpen,
  CheckCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { useSidebar } from '@/shared/hooks/useSidebar';
import { useFavoriteLibraries } from '@/shared/hooks/useFavorites';
import { Loader } from '@/shared/components/ui/loader';
import { getStudyPath, getTestSetupPath } from '@/shared/constants/routes';

import React from 'react'

function NavFavoritesBase({
  favorites,
  loading = false,
}: {
  favorites: { name: string; url: string }[];
  loading?: boolean;
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { toggleFavorite } = useFavoriteLibraries()
  
  // Track progress state for each favorite
  const [progressStates, setProgressStates] = React.useState<Record<string, boolean>>({});

  // Load progress for all favorites
  React.useEffect(() => {
    const loadProgressStates = async () => {
      const newStates: Record<string, boolean> = {};
      
      for (const item of favorites) {
        const libraryId = item.url.split('/').pop() || '';
        if (libraryId) {
          try {
            const progressRepo = await import('@/shared/lib/repositories/ProgressRepository').then(m => m.progressRepository);
            const progress = await progressRepo.getUserLibraryProgress(libraryId);
            newStates[libraryId] = (progress?.engineState && Object.keys(progress.engineState).length > 0) || false;
          } catch {
            newStates[libraryId] = false;
          }
        }
      }
      
      setProgressStates(newStates);
    };

    if (favorites.length > 0) {
      loadProgressStates();
    }
  }, [favorites]);

  const handleItemClick = (url: string ) => {
    navigate(url)
  }

  const handleRemoveFavorite = async (libraryId: string) => {
    try {
      await toggleFavorite(libraryId, true)
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  const handleOpenInNewTab = (url: string) => {
    window.open(url, '_blank')
  }

  const handleStudyNow = (libraryId: string) => {
    navigate(getStudyPath(libraryId))
  }

  const handleCheckTest = (libraryId: string) => {
    navigate(getTestSetupPath(libraryId))
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="h-6 w-6 rounded-lg bg-warning/10 flex items-center justify-center">
          <Folder className="h-3.5 w-3.5 text-warning" />
        </div>
        Thư viện yêu thích
      </SidebarGroupLabel>
      <SidebarMenu className="gap-2">
        {loading && favorites.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="px-3 py-2 rounded-lg">
              <Loader size="sm" className="h-4 w-4" />
              <span className="text-sm">Đang tải...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        {!loading && favorites.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="px-3 py-2 rounded-lg opacity-50">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                <Folder className="h-4 w-4" />
              </div>
              <span className="text-sm text-muted-foreground">Chưa có yêu thích</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        {favorites.map((item) => {
          const libraryId = item.url.split('/').pop() || '';
          const hasProgress = progressStates[libraryId] || false;
          
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                onClick={() => handleItemClick(item.url)}
                title={item.name}
                className="group/item flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200 w-full"
              >
                <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center group-hover/item:bg-warning/20 transition-colors shrink-0">
                  <Folder className="h-4 w-4 text-warning" />
                </div>
                <span className="text-sm font-medium truncate min-w-0 flex-1">{item.name}</span>
                {hasProgress && (
                  <div className="shrink-0 h-2 w-2 rounded-full bg-success animate-pulse-soft" />
                )}
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction 
                    showOnHover 
                    className="rounded-lg hover:bg-sidebar-accent/70"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Thêm</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-xl border border-border/30 bg-popover backdrop-blur-sm shadow-[var(--neu-shadow-lg)] dark:border-white/10"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem 
                    onClick={() => handleStudyNow(libraryId)}
                    className="gap-3 rounded-lg px-3 py-2.5"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{hasProgress ? 'Tiếp tục học' : 'Học ngay'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleCheckTest(libraryId)}
                    className="gap-3 rounded-lg px-3 py-2.5"
                  >
                    <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Kiểm tra</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-border/50" />
                  <DropdownMenuItem 
                    onClick={() => handleOpenInNewTab(item.url)}
                    className="gap-3 rounded-lg px-3 py-2.5"
                  >
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    <span>Mở tab mới</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRemoveFavorite(libraryId)}
                    className="gap-3 rounded-lg px-3 py-2.5 text-destructive"
                  >
                    <StarOff className="h-4 w-4" />
                    <span>Xóa yêu thích</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleCopyLink(item.url)}
                    className="gap-3 rounded-lg px-3 py-2.5"
                  >
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Sao chép link</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export const NavFavorites = React.memo(NavFavoritesBase);
