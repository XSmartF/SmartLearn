import { Button } from '@/shared/components/ui/button'
import { Bell, Check, Filter } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSection } from '@/shared/components/PageSection'
import { NotificationFeed, NotificationQuickActions, NotificationSummaryStats } from '../components'
import { useNotificationCenterView } from '../hooks/useNotificationCenterView'

export default function Notifications() {
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    tabs,
    notifications,
    filteredNotifications,
    notificationsLoading,
    notificationActionId,
    markingAllNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    typeConfig,
    typeFallbackIcon,
    notificationAccessRequestMap,
    requests,
    requestsLoading,
    handledRequests,
    requestActionId,
    handleRequestDecision,
    summary,
    quickActions,
  } = useNotificationCenterView()

  return (
    <div className="space-y-8 sm:space-y-12">
      <PageHeader
        title="Trung tâm thông báo"
        eyebrow="Thông báo & yêu cầu"
        description="Theo dõi hoạt động mới nhất và quản lý các yêu cầu quyền truy cập từ bạn bè và cộng sự."
        icon={<Bell className="h-6 w-6 text-primary" />}
        actions={
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={handleMarkAllAsRead}
              disabled={markingAllNotifications}
            >
              <Check className="mr-2 h-4 w-4" />
              Đánh dấu tất cả đã đọc
            </Button>
            <Button variant="outline" size="lg">
              <Filter className="mr-2 h-4 w-4" />
              Cài đặt thông báo
            </Button>
          </>
        }
      />

      <PageSection
        heading="Tổng quan hoạt động"
        description="Một cái nhìn nhanh về những cập nhật mới nhất của bạn."
      >
        <NotificationSummaryStats summary={summary} />
      </PageSection>

      <PageSection
        heading="Danh sách thông báo"
        description="Lọc theo danh mục để xử lý nhanh các thông báo quan trọng."
      >
        <NotificationFeed
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          filteredNotifications={filteredNotifications}
          notificationsLoading={notificationsLoading}
          typeConfig={typeConfig}
          fallbackIcon={typeFallbackIcon}
          notificationActionId={notificationActionId}
          onMarkAsRead={handleMarkAsRead}
          notificationAccessRequestMap={notificationAccessRequestMap}
          handledRequests={handledRequests}
          onRequestDecision={handleRequestDecision}
          requestActionId={requestActionId}
          requests={requests}
          requestsLoading={requestsLoading}
        />
      </PageSection>

      <PageSection
        heading="Thao tác nhanh"
        description="Bật ngay các tùy chọn phổ biến cho thông báo học tập của bạn."
      >
        <NotificationQuickActions actions={quickActions} />
      </PageSection>
    </div>
  )
}
