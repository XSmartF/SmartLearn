"use client"

import * as React from "react"
import {
  AudioWaveform,
  Calendar,
  Command,
  Home,
  Settings2,
  Bell,
  Library,
  BookOpen,
  Apple,
  Star,
  Briefcase,
  Target,
  Brain,
  Handshake,
  Palette,
  PenTool,
  Image,
  Music,
  DollarSign,
  Wrench,
  Calendar as CalendarIcon,
  Luggage,
  Map,
  Globe,
  Camera
} from "lucide-react"

import { NavFavorites } from "@/shared/components/nav-favorites"
import { useFavoriteLibraries } from '@/shared/hooks/useFavorites';
import { NavMain } from "@/shared/components/nav-main"
import { userRepository } from '@/shared/lib/repositories/UserRepository'
// Removed NavSecondary per requirement
// import { TeamSwitcher } from "@/shared/components/team-switcher" // replaced by Brand
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarFooter,
  SidebarSeparator,
} from "@/shared/components/ui/sidebar"
import { Brand } from '@/shared/components/Brand'
import { NavUser } from '@/shared/components/NavUser'
import { ROUTES } from '@/shared/constants/routes'

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
      url: ROUTES.HOME,
      icon: Home,
      match: (pathname: string) => pathname === ROUTES.HOME
    },
    {
      title: "Thư viện của tôi",
      url: ROUTES.MY_LIBRARY,
      icon: Library,
    },
    {
      title: "Lịch trình",
      url: ROUTES.CALENDAR,
      icon: Calendar,
    },
    {
      title: "Cài đặt",
      url: ROUTES.SETTINGS,
      icon: Settings2,
    },
    {
      title: "Thông báo",
      url: ROUTES.NOTIFICATIONS,
      icon: Bell,
    },
  ],
  // favorites removed (dynamic)
  workspaces: [
    {
      name: "Personal Life Management",
      icon: Home,
      pages: [
        {
          name: "Daily Journal & Reflection",
          url: "#",
          icon: BookOpen,
        },
        {
          name: "Health & Wellness Tracker",
          url: "#",
          icon: Apple,
        },
        {
          name: "Personal Growth & Learning Goals",
          url: "#",
          icon: Star,
        },
      ],
    },
    {
      name: "Professional Development",
      icon: Briefcase,
      pages: [
        {
          name: "Career Objectives & Milestones",
          url: "#",
          icon: Target,
        },
        {
          name: "Skill Acquisition & Training Log",
          url: "#",
          icon: Brain,
        },
        {
          name: "Networking Contacts & Events",
          url: "#",
          icon: Handshake,
        },
      ],
    },
    {
      name: "Creative Projects",
      icon: Palette,
      pages: [
        {
          name: "Writing Ideas & Story Outlines",
          url: "#",
          icon: PenTool,
        },
        {
          name: "Art & Design Portfolio",
          url: "#",
          icon: Image,
        },
        {
          name: "Music Composition & Practice Log",
          url: "#",
          icon: Music,
        },
      ],
    },
    {
      name: "Home Management",
      icon: Home,
      pages: [
        {
          name: "Household Budget & Expense Tracking",
          url: "#",
          icon: DollarSign,
        },
        {
          name: "Home Maintenance Schedule & Tasks",
          url: "#",
          icon: Wrench,
        },
        {
          name: "Family Calendar & Event Planning",
          url: "#",
          icon: CalendarIcon,
        },
      ],
    },
    {
      name: "Travel & Adventure",
      icon: Luggage,
      pages: [
        {
          name: "Trip Planning & Itineraries",
          url: "#",
          icon: Map,
        },
        {
          name: "Travel Bucket List & Inspiration",
          url: "#",
          icon: Globe,
        },
        {
          name: "Travel Journal & Photo Gallery",
          url: "#",
          icon: Camera,
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
    if (url.startsWith('/library')) import('@/features/library/pages/LibraryDetail').catch(()=>{});  
    else if (url === ROUTES.MY_LIBRARY) import('@/features/library/pages/MyLibrary').catch(()=>{});  
    else if (url === ROUTES.NOTIFICATIONS) import('@/features/notification/pages/Notifications').catch(()=>{});  
  };  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="px-2 pt-2 pb-1">
          <Brand to="/" />
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
        <NavFavorites favorites={favorites.map(f => ({ name: f.title, url: `/library/${f.id}` }))} loading={loading} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
});
