import { TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Badge } from '@/shared/components/ui/badge'
import type { NotificationTabWithCount } from '../../types'

interface NotificationFeedTabsProps {
  tabs: NotificationTabWithCount[]
  requestsCount: number
}

export function NotificationFeedTabs({ tabs, requestsCount }: NotificationFeedTabsProps) {
  return (
    <TabsList className="bg-muted/60 rounded-full p-1 flex w-full overflow-x-auto">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          className="text-xs sm:text-sm"
        >
          <span>{tab.label}</span>
          <Badge variant="secondary" className="ml-2 hidden sm:inline-flex text-xs">
            {tab.count}
          </Badge>
          <span className="ml-1 inline-flex sm:hidden text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            {tab.count}
          </span>
        </TabsTrigger>
      ))}
      <TabsTrigger
        value="requests"
        className="text-xs sm:text-sm"
      >
        <span>Yêu cầu truy cập</span>
        <Badge variant="secondary" className="ml-2 text-xs">
          {requestsCount}
        </Badge>
      </TabsTrigger>
    </TabsList>
  )
}
