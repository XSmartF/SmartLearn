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
      <SidebarGroupLabel className="text-xs sm:text-sm">Bộ flashcard yêu thích</SidebarGroupLabel>
      <SidebarMenu>
        {loading && favorites.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <Folder className="h-4 w-4" />
              <span>Đang tải...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        {!loading && favorites.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <Folder className="h-4 w-4" />
              <span>Chưa có</span>
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
              >
                <Folder className="h-4 w-4" />
                <span>{item.name}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">Thêm</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem onClick={() => handleStudyNow(libraryId)}>
                    <BookOpen className="text-muted-foreground" />
                    <span>{hasProgress ? 'Tiếp tục học' : 'Học ngay'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCheckTest(libraryId)}>
                    <CheckCircle className="text-muted-foreground" />
                    <span>Kiểm tra</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleOpenInNewTab(item.url)}>
                    <ArrowUpRight className="text-muted-foreground" />
                    <span>Mở trong tab mới</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRemoveFavorite(libraryId)}>
                    <StarOff className="text-muted-foreground" />
                    <span>Xóa khỏi yêu thích</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyLink(item.url)}>
                    <LinkIcon className="text-muted-foreground" />
                    <span>Sao chép liên kết</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          );
        })}
        {favorites.length > 5 && (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal />
              <span>Xem thêm</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export const NavFavorites = React.memo(NavFavoritesBase);
