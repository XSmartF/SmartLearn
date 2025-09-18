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
      <SidebarGroupLabel>Ghi chép yêu thích</SidebarGroupLabel>
      <SidebarMenu>
        {favoriteNotes.slice(0, 5).map((note) => (
          <SidebarMenuItem key={note.id}>
            <SidebarMenuButton onClick={() => handleItemClick(note.id)}>
              <BookOpen />
              <span className="truncate">{note.title || `Note ${note.id.slice(0, 8)}`}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleOpenInNewTab(note.id)}>
                  <ArrowUpRight className="text-muted-foreground" />
                  Mở trong tab mới
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopyLink(note.id)}>
                  <LinkIcon className="text-muted-foreground" />
                  Sao chép liên kết
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleRemoveFavorite(note.id)}>
                  <StarOff className="text-muted-foreground" />
                  Bỏ yêu thích
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