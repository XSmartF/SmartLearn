import { Search } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'

interface NotificationFeedSearchProps {
  value: string
  onChange: (value: string) => void
}

export function NotificationFeedSearch({ value, onChange }: NotificationFeedSearchProps) {
  return (
    <div className="relative max-w-xl w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Tìm kiếm thông báo..."
        className="pl-10"
      />
    </div>
  )
}
