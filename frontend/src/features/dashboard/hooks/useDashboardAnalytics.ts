import { useMemo } from 'react';

export interface DashboardNotification {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'info';
  timestamp: string;
}

export interface DashboardAssignment {
  id: string;
  title: string;
  priority: 'urgent' | 'in-progress' | 'normal';
  dueTime: string;
  statusLabel: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  timeRange: string;
  progress: number;
  theme: 'primary' | 'warning' | 'info';
}

export interface DashboardMeeting {
  id: string;
  title: string;
  attendees: number;
  participants: string;
  action: string;
  highlight: string;
}

export interface DashboardProductivityPoint {
  date: string;
  label: string;
  focusMinutes: number;
  reviewSessions: number;
}

export interface DashboardTopicCompletion {
  topic: string;
  completion: number;
  color: string;
}

interface DashboardAnalytics {
  notifications: DashboardNotification[];
  assignments: DashboardAssignment[];
  tasks: DashboardTask[];
  meetings: DashboardMeeting[];
  productivity: DashboardProductivityPoint[];
  completion: DashboardTopicCompletion[];
}

export function useDashboardAnalytics(): DashboardAnalytics {
  return useMemo(() => ({
    notifications: [
      {
        id: 'notif-1',
        title: 'Sự kiện sắp tới',
        description: 'Workshop UI/UX • 9:41-11:45 sáng',
        status: 'new',
        timestamp: 'Hôm nay'
      },
      {
        id: 'notif-2',
        title: 'Tin nhắn • Thiết kế sản phẩm',
        description: '30 phút trước',
        status: 'info',
        timestamp: '30 phút trước'
      }
    ],
    assignments: [
      {
        id: 'assign-1',
        title: 'Thiết kế concept bao bì cho sản phẩm mới',
        priority: 'urgent',
        dueTime: 'Trong hôm nay',
        statusLabel: 'Khẩn cấp'
      },
      {
        id: 'assign-2',
        title: 'Xây dựng tài liệu onboarding',
        priority: 'in-progress',
        dueTime: 'Còn 2 ngày',
        statusLabel: 'Đang tiến hành'
      }
    ],
    tasks: [
      { id: 'task-1', title: 'Nghiên cứu tiến hành', timeRange: '9:11-10:46 sáng', progress: 0.9, theme: 'primary' },
      { id: 'task-2', title: 'Sắp xếp cuộc họp', timeRange: '9:00-12:30 chiều', progress: 0.5, theme: 'warning' },
      { id: 'task-3', title: 'Gửi nhắc nhở', timeRange: '9:11-10:30 sáng', progress: 0.1, theme: 'info' }
    ],
    meetings: [
      {
        id: 'meet-1',
        title: 'Họp với khách hàng mới',
        attendees: 4,
        participants: 'John Smith và 3 người khác',
        action: 'Lên lịch lại',
        highlight: 'Tham gia ngay'
      }
    ],
    productivity: Array.from({ length: 7 }, (_, index) => {
      const reference = new Date();
      reference.setDate(reference.getDate() - (6 - index));
      const label = reference.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      return {
        date: reference.toISOString(),
        label,
        focusMinutes: 300 + index * 25,
        reviewSessions: 8 + index,
      };
    }),
    completion: [
      { topic: 'Marketing', completion: 82, color: 'hsl(var(--primary))' },
      { topic: 'Thiết kế', completion: 68, color: 'hsl(var(--accent))' },
      { topic: 'Phân tích dữ liệu', completion: 92, color: 'hsl(var(--success))' }
    ]
  }), []);
}
