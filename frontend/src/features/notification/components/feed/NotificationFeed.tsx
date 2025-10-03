import type { ComponentType } from 'react'
import { Tabs, TabsContent } from '@/shared/components/ui/tabs'
import { NotificationFeedSearch } from './NotificationFeedSearch'
import { NotificationFeedTabs } from './NotificationFeedTabs'
import { NotificationList } from './NotificationList'
import { AccessRequestsPanel } from '../requests/AccessRequestsPanel'
import type {
  AccessRequestDecision,
  AccessRequestSummary,
  NotificationItem,
  NotificationTabId,
  NotificationTabWithCount,
  NotificationTypeConfigMap,
} from '../../types'

interface NotificationFeedProps {
  tabs: NotificationTabWithCount[]
  activeTab: NotificationTabId
  onTabChange: (tabId: NotificationTabId) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  notifications: NotificationItem[]
  filteredNotifications: NotificationItem[]
  notificationsLoading: boolean
  typeConfig: NotificationTypeConfigMap
  fallbackIcon: ComponentType<{ className?: string }>
  notificationActionId: string | null
  onMarkAsRead: (notificationId: string) => void
  notificationAccessRequestMap: Record<string, string>
  handledRequests: Record<string, AccessRequestDecision>
  onRequestDecision: (
    requestId: string,
    decision: AccessRequestDecision,
    options?: { notificationId?: string }
  ) => void
  requestActionId: string | null
  requests: AccessRequestSummary[]
  requestsLoading: boolean
}

export function NotificationFeed({
  tabs,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  notifications,
  filteredNotifications,
  notificationsLoading,
  typeConfig,
  fallbackIcon,
  notificationActionId,
  onMarkAsRead,
  notificationAccessRequestMap,
  handledRequests,
  onRequestDecision,
  requestActionId,
  requests,
  requestsLoading,
}: NotificationFeedProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <NotificationFeedSearch value={searchQuery} onChange={onSearchChange} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as NotificationTabId)}
        className="space-y-4 sm:space-y-6"
      >
        <NotificationFeedTabs tabs={tabs} requestsCount={requests.length} />

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <NotificationList
              notifications={notifications}
              filteredNotifications={filteredNotifications}
              searchTerm={searchQuery}
              isLoading={notificationsLoading}
              typeConfig={typeConfig}
              fallbackIcon={fallbackIcon}
              notificationActionId={notificationActionId}
              onMarkAsRead={onMarkAsRead}
              notificationAccessRequestMap={notificationAccessRequestMap}
              handledRequests={handledRequests}
              onRequestDecision={onRequestDecision}
              requestActionId={requestActionId}
            />
          </TabsContent>
        ))}

        <TabsContent value="requests">
          <AccessRequestsPanel
            requests={requests}
            loading={requestsLoading}
            onDecision={onRequestDecision}
            handledRequests={handledRequests}
            actionRequestId={requestActionId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
