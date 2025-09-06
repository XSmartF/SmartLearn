"use client"

import {
  ArrowUpRight,
  Link as LinkIcon,
  MoreHorizontal,
  StarOff,
  Trash2,
  Folder,
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

  const handleItemClick = (url: string ) => {
    navigate(url)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Bộ flashcard yêu thích</SidebarGroupLabel>
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
        {favorites.map((item) => (
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
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <StarOff className="text-muted-foreground" />
                  <span>Remove from Favorites</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LinkIcon className="text-muted-foreground" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowUpRight className="text-muted-foreground" />
                  <span>Open in New Tab</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {favorites.length > 5 && (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export const NavFavorites = React.memo(NavFavoritesBase);
