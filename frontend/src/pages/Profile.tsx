import { useAuth } from '@/shared/hooks/useAuthRedux'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { User as UserIcon, Loader2, Trophy } from 'lucide-react'
import { Avatar } from '@/shared/components/ui/avatar'
// Đã bỏ phần Giao diện (theme) theo yêu cầu
import { Progress } from '@/shared/components/ui/progress'
import { useAchievements } from '@/shared/hooks/useAchievements'
import { H1 } from '@/shared/components/ui/typography'

interface User {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  id?: string;
}

export default function Profile() {
  const { user: rawUser } = useAuth()
  const user = rawUser as User
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { achievements, loading: loadingAch, refresh } = useAchievements()

  // NOTE: Hiện adapter chưa có updateProfile tuỳ biến; có thể thêm API sau
  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage(null)
    try {
      // Placeholder: gọi Firebase updateProfile nếu cần mở rộng
      // Hiện tại chỉ hiển thị thông báo thành công phía client
      await new Promise(r => setTimeout(r, 600))
      setMessage('Đã lưu (mô phỏng). Cần triển khai backend để cập nhật thực.')
  } catch {
      setMessage('Lỗi khi lưu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="space-y-2">
        <H1 className="text-3xl font-bold tracking-tight">Hồ sơ</H1>
        <p className="text-muted-foreground">Quản lý thông tin tài khoản và tuỳ chỉnh trải nghiệm.</p>
      </header>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Chỉnh sửa tên hiển thị và ảnh đại diện.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden ring-4 ring-background shadow">
                  {avatarUrl || user?.avatarUrl ? (
                    <Avatar src={avatarUrl || user?.avatarUrl} alt={displayName || user?.email} size={96} className="h-full w-full" fallback={(displayName || user?.email || '?').slice(0,2).toUpperCase()} />
                  ) : (
                    (displayName || user?.email || '?').slice(0,2).toUpperCase()
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium">Tên hiển thị</label>
                  <Input value={displayName} onChange={e=> setDisplayName(e.target.value)} placeholder="Nhập tên..." className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Avatar URL</label>
                  <Input value={avatarUrl} onChange={e=> setAvatarUrl(e.target.value)} placeholder="https://..." className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Tạm thời chỉ hỗ trợ URL. Có thể thêm upload sau.</p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
              <Button disabled={saving} onClick={handleSave} className="min-w-32">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
              {message && <span className="text-xs text-muted-foreground">{message}</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Các trường chỉ đọc.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Email</span><span className="font-medium truncate max-w-40 text-right">{user?.email}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">User ID</span><span className="font-mono text-xs truncate max-w-40 text-right">{user?.id}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Tên hiển thị</span><span className="truncate max-w-40 text-right">{displayName || user?.displayName || '-'}</span></div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Ghi chú</CardTitle>
            <CardDescription>Những tính năng sắp tới.</CardDescription>
          </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-start gap-2"><UserIcon className="h-4 w-4 mt-0.5" /><p>Upload avatar trực tiếp.</p></div>
              <div className="flex items-start gap-2"><UserIcon className="h-4 w-4 mt-0.5" /><p>Đồng bộ hoá theme lên cloud.</p></div>
              <div className="flex items-start gap-2"><UserIcon className="h-4 w-4 mt-0.5" /><p>Bảo mật 2FA.</p></div>
            </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" />Thành tích</CardTitle>
              <CardDescription>Tiến độ học tập tổng hợp (client-side).</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loadingAch}>{loadingAch ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Làm mới'}</Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {achievements.map(a => (
              <div key={a.id} className={`rounded-lg border p-4 bg-background/50 flex flex-col gap-2 ${a.earned ? 'shadow-sm ring-1 ring-yellow-400/40' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2 text-sm">{a.icon && <span className="text-lg leading-none">{a.icon}</span>}{a.title}</div>
                    <p className="text-xs text-muted-foreground leading-snug">{a.description}</p>
                  </div>
                  {a.earned && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 font-medium">Đạt</span>}
                </div>
                {typeof a.progress === 'number' && (
                  <div className="space-y-1">
                    <Progress value={Math.round(a.progress*100)} />
                    <div className="text-[10px] text-muted-foreground">{Math.round(a.progress*100)}%</div>
                  </div>
                )}
              </div>
            ))}
            {!achievements.length && !loadingAch && <p className="text-xs text-muted-foreground col-span-full">Chưa có dữ liệu thành tích.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
