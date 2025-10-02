"use client"

import {
  ArrowUpRight,
  Link as LinkIcon,
  MoreHorizontal,
  StarOff,
  BookOpen,
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
import { useNoteFavorites, useUserNotes } from '@/shared/hooks/useNotes';
import { Loader } from '@/shared/components/ui/loader';
import { getNoteDetailPath } from '@/shared/constants/routes';

import React from 'react'

function NavFavoriteNotesBase({
  favorites,
  loading = false,
}: {
  favorites: string[];
  loading?: boolean;
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { toggleFavorite } = useNoteFavorites()
  const { notes } = useUserNotes()

  const favoriteNotes = React.useMemo(() => 
    notes.filter(note => favorites.includes(note.id)), 
    [notes, favorites]
  )

  const handleItemClick = (noteId: string) => {
    navigate(getNoteDetailPath(noteId))
  }

  const handleRemoveFavorite = async (noteId: string) => {
    try {
      await toggleFavorite(noteId, true)
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  const handleOpenInNewTab = (noteId: string) => {
    window.open(getNoteDetailPath(noteId), '_blank')
  }

  const handleCopyLink = (noteId: string) => {
    navigator.clipboard.writeText(window.location.origin + getNoteDetailPath(noteId))
  }

  if (loading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Ghi chép yêu thích</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <Loader size="sm" />
              <span>Đang tải...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  if (favorites.length === 0) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="h-6 w-6 rounded-lg bg-info/10 flex items-center justify-center">
          <BookOpen className="h-3.5 w-3.5 text-info" />
        </div>
        Ghi chép yêu thích
      </SidebarGroupLabel>
      <SidebarMenu className="gap-2">
        {favoriteNotes.slice(0, 5).map((note) => (
          <SidebarMenuItem key={note.id}>
            <SidebarMenuButton 
              onClick={() => handleItemClick(note.id)}
              className="group/item flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200 w-full"
            >
              <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center group-hover/item:bg-info/20 transition-colors shrink-0">
                <BookOpen className="h-4 w-4 text-info" />
              </div>
              <span className="text-sm font-medium truncate min-w-0 flex-1">{note.title || `Note ${note.id.slice(0, 8)}`}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction 
                  showOnHover
                  className="rounded-lg hover:bg-sidebar-accent/70"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-xl border border-border/30 bg-popover backdrop-blur-sm shadow-[var(--neu-shadow-lg)] dark:border-white/10"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem 
                  onClick={() => handleOpenInNewTab(note.id)}
                  className="gap-3 rounded-lg px-3 py-2.5"
                >
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  <span>Mở tab mới</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleCopyLink(note.id)}
                  className="gap-3 rounded-lg px-3 py-2.5"
                >
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Sao chép link</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-border/50" />
                <DropdownMenuItem 
                  onClick={() => handleRemoveFavorite(note.id)}
                  className="gap-3 rounded-lg px-3 py-2.5 text-destructive"
                >
                  <StarOff className="h-4 w-4" />
                  <span>Bỏ yêu thích</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export const NavFavoriteNotes = React.memo(NavFavoriteNotesBase)