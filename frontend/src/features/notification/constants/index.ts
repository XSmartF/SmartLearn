import {
  AlertCircle,
  Award,
  Bell,
  BellRing,
  BookOpen,
  Calendar,
  Check,
  MessageSquare,
  Star,
  X,
} from 'lucide-react'
import type {
  NotificationFeedTabId,
  NotificationQuickActionItem,
  NotificationTabOption,
  NotificationTypeConfigMap,
} from '../types'

export const NOTIFICATION_FEED_TABS: NotificationTabOption[] = [
  {
    id: 'all',
    label: 'Tất cả',
    filter: () => true,
    description: 'Hiển thị toàn bộ thông báo gần đây của bạn.',
  },
  {
    id: 'unread',
    label: 'Chưa đọc',
    filter: (notification) => !notification.read,
    description: 'Thông báo bạn chưa xử lý.',
  },
  {
    id: 'flashcards',
    label: 'Flashcard',
    filter: (notification) => notification.type === 'flashcard' || notification.type === 'review',
    description: 'Cập nhật từ các bộ flashcard và lịch ôn tập.',
  },
  {
    id: 'reminders',
    label: 'Nhắc nhở',
    filter: (notification) => notification.type === 'reminder' || notification.type === 'streak',
    description: 'Nhắc bạn duy trì thói quen học.',
  },
  {
    id: 'achievements',
    label: 'Thành tích',
    filter: (notification) => notification.type === 'achievement',
    description: 'Ghi nhận thành tích và mốc quan trọng.',
  },
]

export const NOTIFICATION_TYPE_CONFIG: NotificationTypeConfigMap = {
  flashcard: {
    icon: BookOpen,
    badgeLabel: 'Flashcard',
    badgeVariant: 'default',
  },
  review: {
    icon: AlertCircle,
    badgeLabel: 'Ôn tập',
    badgeVariant: 'secondary',
  },
  achievement: {
    icon: Award,
    badgeLabel: 'Thành tích',
    badgeVariant: 'outline',
    badgeClassName: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  share: {
    icon: MessageSquare,
    badgeLabel: 'Chia sẻ',
    badgeVariant: 'outline',
  },
  streak: {
    icon: Calendar,
    badgeLabel: 'Streak',
    badgeVariant: 'outline',
    badgeClassName: 'bg-green-50 text-green-700 border-green-200',
  },
  reminder: {
    icon: Star,
    badgeLabel: 'Nhắc nhở',
    badgeVariant: 'outline',
  },
  suggestion: {
    icon: BookOpen,
    badgeLabel: 'Gợi ý',
    badgeVariant: 'outline',
  },
  system: {
    icon: Bell,
    badgeLabel: 'Hệ thống',
    badgeVariant: 'outline',
  },
  access_request: {
    icon: MessageSquare,
    badgeLabel: 'Yêu cầu truy cập',
    badgeVariant: 'outline',
  },
  access_request_approved: {
    icon: Check,
    badgeLabel: 'Đã chấp nhận',
    badgeVariant: 'outline',
    badgeClassName: 'bg-green-50 text-green-700 border-green-200',
  },
  access_request_rejected: {
    icon: X,
    badgeLabel: 'Đã từ chối',
    badgeVariant: 'outline',
    badgeClassName: 'bg-red-50 text-red-700 border-red-200',
  },
}

export const NOTIFICATION_FALLBACK_ICON = Bell

export const NOTIFICATION_FEED_TAB_IDS: NotificationFeedTabId[] = NOTIFICATION_FEED_TABS.map((tab) => tab.id)

export const NOTIFICATION_QUICK_ACTIONS: NotificationQuickActionItem[] = [
  {
    id: 'email-alerts',
    label: 'Thông báo email',
    icon: BellRing,
    description: 'Nhận bản tóm tắt hàng tuần trong hộp thư.',
  },
  {
    id: 'review-reminders',
    label: 'Nhắc nhở ôn tập',
    icon: Calendar,
    description: 'Thiết lập nhắc nhở để giữ streak luyện tập.',
  },
  {
    id: 'flashcard-updates',
    label: 'Cập nhật flashcard',
    icon: BookOpen,
    description: 'Đẩy nhanh cập nhật khi có thẻ mới.',
  },
  {
    id: 'share-flashcards',
    label: 'Chia sẻ bộ thẻ',
    icon: MessageSquare,
    description: 'Cho phép bạn bè truy cập bộ flashcard của bạn.',
  },
]
