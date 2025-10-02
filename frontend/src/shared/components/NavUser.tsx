import { useAuth } from '../hooks/useAuthRedux'
import { useState } from 'react'
import { LogOut, Moon, Sun, User as UserIcon, UserCircle2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { Avatar } from '@/shared/components/ui/avatar'
import { usePersistentTheme } from '@/shared/hooks/usePersistentTheme'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

export function NavUser() {
interface User {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

  const { user: rawUser, signOut } = useAuth()
  const user = rawUser as User
  const { theme, setTheme } = usePersistentTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  if (!user) return null
  const initials = (user.displayName || user.email || '?')
    .split(/\s+/)
    .map((p: string) => p[0])
    .slice(0,2)
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button 
          className={cn(
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300',
            'hover:bg-sidebar-accent/70 hover:shadow-[var(--neu-shadow-sm)]',
            'dark:hover:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-1px_-1px_4px_rgba(255,255,255,0.03)]'
          )}
        >
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-[var(--neu-shadow-sm)] group-hover:shadow-[var(--neu-shadow)] transition-all duration-300">
              {user.avatarUrl ? (
                <Avatar src={user.avatarUrl} alt={user.displayName || user.email} size={40} className="h-full w-full" fallback={initials} />
              ) : (
                <span className="drop-shadow-sm">{initials}</span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-sidebar" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-semibold truncate text-sm text-foreground group-hover:text-primary transition-colors">
              {user.displayName || user.email}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
          <div className={cn(
            "ml-auto text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        side="top" 
        align="start" 
        className="z-[100] min-w-[240px] rounded-xl border border-border/30 bg-popover backdrop-blur-sm p-2 text-popover-foreground shadow-[var(--neu-shadow-lg)] focus:outline-none dark:border-white/10 dark:shadow-[10px_10px_32px_rgba(0,0,0,0.7),-4px_-4px_20px_rgba(255,255,255,0.05)]"
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Tài khoản
        </DropdownMenuLabel>
        <div className="px-3 py-3 mb-2 flex items-center gap-3 rounded-lg bg-sidebar-accent/30">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-[var(--neu-shadow-sm)]">
            {user.avatarUrl ? (
              <Avatar src={user.avatarUrl} alt={user.displayName || user.email} size={48} className="h-full w-full" fallback={<UserIcon className='h-6 w-6' />} />
            ) : (
              <UserIcon className="h-6 w-6 drop-shadow-sm" />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold truncate text-foreground">{user.displayName || 'Người dùng'}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator className="h-px my-2 bg-border/50" />
        <DropdownMenuItem asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-sidebar-accent/70" 
            onClick={()=> navigate(ROUTES.PROFILE)}
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <UserCircle2 className="h-4 w-4" />
            </div>
            Hồ sơ cá nhân
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-sidebar-accent/70" 
            onClick={()=> setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </div>
            {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
          </Button>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="h-px my-2 bg-border/50" />
        <DropdownMenuItem asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive" 
            onClick={()=> signOut().catch(()=>{})}
          >
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-4 w-4" />
            </div>
            Đăng xuất
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
