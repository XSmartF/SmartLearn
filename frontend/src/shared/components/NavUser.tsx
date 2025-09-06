import { useAuth } from '../hooks/useAuthRedux'
import { useState } from 'react'
import { LogOut, Moon, Sun, User as UserIcon, UserCircle2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { Avatar } from '@/shared/components/ui/avatar'
import { usePersistentTheme } from '@/shared/hooks/usePersistentTheme'
import { useNavigate } from 'react-router-dom'

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
        <button className={cn('flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-left text-sm')}> 
          <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
            {user.avatarUrl ? <Avatar src={user.avatarUrl} alt={user.displayName || user.email} size={36} className="h-full w-full" fallback={initials} /> : initials}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="font-medium truncate">{user.displayName || user.email}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{open ? '▲' : '▼'}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="z-50 min-w-[220px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Tài khoản</DropdownMenuLabel>
        <div className="px-2 py-2 flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm overflow-hidden">
            {user.avatarUrl ? <Avatar src={user.avatarUrl} alt={user.displayName || user.email} size={40} className="h-full w-full" fallback={<UserIcon className='h-5 w-5' />} /> : <UserIcon className="h-5 w-5" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{user.displayName || 'Người dùng'}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator className="h-px my-1 bg-border" />
        <DropdownMenuItem asChild>
          <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-1.5 text-sm" onClick={()=> navigate('/dashboard/profile')}>
            <UserCircle2 className="h-4 w-4" />
            Hồ sơ
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-1.5 text-sm" onClick={()=> setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Đổi giao diện ({theme === 'dark' ? 'Sáng' : 'Tối'})
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-1.5 text-sm text-red-600 hover:text-red-700" onClick={()=> signOut().catch(()=>{})}>
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
