"use client"

import * as React from "react"
import {
  AudioWaveform,
  Calendar,
  Command,
  Home,
  Settings2,
  Bell,
  Library
} from "lucide-react"

import { NavFavorites } from "@/components/nav-favorites"
import { useFavoriteLibraries } from '@/hooks/useFavorites';
import { NavMain } from "@/components/nav-main"
import { userRepository } from '@/lib/repositories/UserRepository'
// Removed NavSecondary per requirement
// import { TeamSwitcher } from "@/components/team-switcher" // replaced by Brand
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Brand } from '@/components/Brand'
import { NavUser } from '@/components/NavUser'

// Static navigation items; favorites now dynamic
const baseData = {
  teams: [
    {
      name: "Acme Inc",
      logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Trang chủ",
      url: "/dashboard",
      icon: Home,
  match: (pathname: string) => pathname === '/dashboard' || pathname === '/dashboard/'
    },
    {
      title: "Thư viện của tôi",
      url: "/dashboard/my-library",
      icon: Library,
    },
    {
      title: "Lịch trình",
      url: "/dashboard/calendar",
      icon: Calendar,
    },
    {
      title: "Cài đặt",
      url: "/dashboard/settings",
      icon: Settings2,
    },
    {
      title: "Thông báo",
      url: "/dashboard/notifications",
      icon: Bell,
    },
  ],
  // favorites removed (dynamic)
  workspaces: [
    {
      name: "Personal Life Management",
      emoji: "🏠",
      pages: [
        {
          name: "Daily Journal & Reflection",
          url: "#",
          emoji: "📔",
        },
        {
          name: "Health & Wellness Tracker",
          url: "#",
          emoji: "🍏",
        },
        {
          name: "Personal Growth & Learning Goals",
          url: "#",
          emoji: "🌟",
        },
      ],
    },
    {
      name: "Professional Development",
      emoji: "💼",
      pages: [
        {
          name: "Career Objectives & Milestones",
          url: "#",
          emoji: "🎯",
        },
        {
          name: "Skill Acquisition & Training Log",
          url: "#",
          emoji: "🧠",
        },
        {
          name: "Networking Contacts & Events",
          url: "#",
          emoji: "🤝",
        },
      ],
    },
    {
      name: "Creative Projects",
      emoji: "🎨",
      pages: [
        {
          name: "Writing Ideas & Story Outlines",
          url: "#",
          emoji: "✍️",
        },
        {
          name: "Art & Design Portfolio",
          url: "#",
          emoji: "🖼️",
        },
        {
          name: "Music Composition & Practice Log",
          url: "#",
          emoji: "🎵",
        },
      ],
    },
    {
      name: "Home Management",
      emoji: "🏡",
      pages: [
        {
          name: "Household Budget & Expense Tracking",
          url: "#",
          emoji: "💰",
        },
        {
          name: "Home Maintenance Schedule & Tasks",
          url: "#",
          emoji: "🔧",
        },
        {
          name: "Family Calendar & Event Planning",
          url: "#",
          emoji: "📅",
        },
      ],
    },
    {
      name: "Travel & Adventure",
      emoji: "🧳",
      pages: [
        {
          name: "Trip Planning & Itineraries",
          url: "#",
          emoji: "🗺️",
        },
        {
          name: "Travel Bucket List & Inspiration",
          url: "#",
          emoji: "🌎",
        },
        {
          name: "Travel Journal & Photo Gallery",
          url: "#",
          emoji: "📸",
        },
      ],
    },
  ],
}

export const AppSidebar = React.memo(function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { favorites, loading } = useFavoriteLibraries();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [pendingReqCount, setPendingReqCount] = React.useState(0);

  React.useEffect(()=>{ let unsub: (()=>void)|null=null; try { unsub = userRepository.listenUserNotifications(list=> { setUnreadCount(list.filter(n=> !n.read).length); }); } catch {/* ignore */} return ()=>{ if(unsub) unsub(); }; }, []);
  React.useEffect(()=>{ let unsub: (()=>void)|null=null; try { unsub = userRepository.listenPendingAccessRequestsForOwner(reqs=> setPendingReqCount(reqs.length)); } catch {/* ignore */} return ()=>{ if(unsub) unsub(); }; }, []);

  const navData = React.useMemo(()=>{
    const badgeTotal = unreadCount + pendingReqCount;
    return {
      teams: baseData.teams,
      navMain: baseData.navMain.map(item => item.title === 'Thông báo' ? { ...item, badge: badgeTotal>0 ? badgeTotal : undefined } : item)
    };
  }, [unreadCount, pendingReqCount]);

  // simple prefetch when hovering nav items (dynamic import route chunks)
  const prefetchRoute = (url: string) => {
    if (url.startsWith('/dashboard/library')) import('@/pages/LibraryDetail').catch(()=>{});
    else if (url.endsWith('/my-library')) import('@/pages/MyLibrary').catch(()=>{});
    else if (url.endsWith('/notifications')) import('@/pages/Notifications').catch(()=>{});
  };

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="px-2 pt-2 pb-1">
          <Brand to="/dashboard" />
        </div>
        <div onMouseOver={(e)=>{
          const target = e.target as HTMLElement;
          const link = target.closest('[data-url]') as HTMLElement | null;
          if (link) { const url = link.getAttribute('data-url'); if(url) prefetchRoute(url); }
        }}>
          <NavMain items={navData.navMain.map(i=> ({ ...i, dataAttr: { url: i.url } }))} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={favorites.map(f => ({ name: f.title, url: `/dashboard/library/${f.id}` }))} loading={loading} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
});
