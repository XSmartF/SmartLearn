import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { AppLanguage } from '@/shared/models/app';
import { useSession } from '@/shared/auth/session';
import { userRepository } from '@/shared/services';

const vi = {
  nav_auth_title: 'Đăng nhập',
  nav_library_detail: 'Chi tiết thư viện',
  nav_note_detail: 'Chi tiết ghi chú',
  nav_test_setup: 'Thiết lập bài kiểm tra',
  nav_test_session: 'Phiên kiểm tra',
  nav_games: 'Trò chơi',
  nav_notifications: 'Thông báo',
  nav_settings: 'Cài đặt',
  nav_profile: 'Hồ sơ',
  tab_dashboard: 'Tổng quan',
  tab_libraries: 'Thư viện',
  tab_study: 'Ôn tập',
  tab_notes: 'Ghi chú',
  tab_more: 'Thêm',
  auth_title_sign_up: 'Đăng ký tài khoản SmartLearn',
  auth_title_sign_in: 'Đăng nhập SmartLearn',
  auth_subtitle: 'Mobile dùng chung Firebase với web, dữ liệu một nguồn.',
  auth_error_required: 'Vui lòng nhập đầy đủ email và mật khẩu.',
  auth_error_password_min: 'Mật khẩu tối thiểu 6 ký tự.',
  auth_error_confirm_mismatch: 'Xác nhận mật khẩu không khớp.',
  auth_error_sign_in_failed: 'Đăng nhập thất bại',
  auth_sign_in: 'Đăng nhập',
  auth_sign_up: 'Đăng ký',
  auth_sign_in_google: 'Đăng nhập với Google',
  auth_processing: 'Đang xử lý...',
  auth_field_display_name: 'Tên hiển thị',
  auth_field_email: 'Email',
  auth_field_password: 'Mật khẩu',
  auth_field_confirm_password: 'Xác nhận mật khẩu',
  auth_terms: 'Đăng nhập đồng nghĩa bạn chấp nhận Điều khoản & Chính sách Bảo mật.',
  dashboard_greeting: 'Xin chào, {name}!',
  dashboard_greeting_default: 'Chào bạn!',
  dashboard_level_up: 'Nâng cao kỹ năng!',
  dashboard_continue: 'Tiếp tục học hôm nay',
  dashboard_quick_stats: 'Thống kê nhanh',
  dashboard_quick_actions: 'Tác vụ nhanh',
  dashboard_stat_libraries: 'Thư viện',
  dashboard_stat_cards: 'Thẻ',
  dashboard_stat_due: 'Đến hạn',
  dashboard_stat_events: 'Sự kiện',
  dashboard_stat_unread: 'Chưa đọc',
  dashboard_stat_streak: 'Chuỗi ngày',
  dashboard_action_libraries: 'Thư viện chi tiết',
  dashboard_action_study: 'Ôn tập và lịch học',
  dashboard_action_test: 'Làm bài kiểm tra nhanh',
  dashboard_action_games: 'Trò chơi mini',
  dashboard_productivity: 'Năng suất 7 ngày',
  dashboard_chart_focus: 'Tập trung',
  dashboard_chart_review: 'Ôn tập',
  dashboard_study_trend: 'Xu hướng học tập',
  dashboard_mastery: 'Mức thành thạo',
  dashboard_weekly_goal: 'Mục tiêu tuần',
  dashboard_library_progress: 'Tiến độ thư viện',
  libraries_create_new: 'Tạo thư viện mới',
  libraries_name_placeholder: 'Tên thư viện',
  libraries_description_placeholder: 'Mô tả ngắn',
  libraries_create_button: 'Tạo thư viện',
  libraries_all: 'Tất cả thư viện',
  libraries_no_description: 'Không có mô tả',
  libraries_card_count: '{count} thẻ',
  libraries_empty: 'Chưa có thư viện nào',
  library_front_placeholder: 'Mặt trước',
  library_back_placeholder: 'Mặt sau',
  library_add_card: 'Thêm thẻ',
  library_card_list: 'Danh sách thẻ',
  library_no_cards: 'Chưa có thẻ nào',
  notes_title: 'Ghi chú học tập',
  notes_create: 'Tạo ghi chú mới',
  notes_list: 'Danh sách ghi chú',
  notes_empty_content: 'Chạm để thêm nội dung ghi chú',
  notes_default_title: 'Ghi chú mới',
  notes_empty: 'Chưa có ghi chú nào',
  note_edit: 'Chỉnh sửa ghi chú',
  note_title_placeholder: 'Tiêu đề',
  note_content_placeholder: 'Nội dung',
  note_save: 'Lưu',
  note_saving: 'Đang lưu...',
  note_updated_at: 'Cập nhật: {time}',
  study_schedule: 'Lịch học',
  study_add_event_placeholder: 'Thêm sự kiện học tập',
  study_add_event: 'Thêm sự kiện',
  study_events: 'Sự kiện',
  study_status_upcoming: 'Sắp tới',
  study_status_completed: 'Hoàn thành',
  study_status_missed: 'Bỏ lỡ',
  study_mark_completed: 'Hoàn thành',
  study_mark_missed: 'Bỏ lỡ',
  study_empty: 'Chưa có sự kiện nào',
  study_mode_title: 'Chế độ học',
  study_mode_start: 'Bắt đầu học',
  study_mode_no_cards: 'Thư viện chưa có thẻ để học',
  more_title: 'Thêm chức năng',
  more_subtitle: 'Đầy đủ các module từ web đã được đưa vào mobile route.',
  more_menu_test: 'Kiểm tra',
  more_menu_games: 'Trò chơi',
  more_menu_notifications: 'Thông báo',
  more_menu_settings: 'Cài đặt',
  more_menu_profile: 'Hồ sơ',
  more_menu_sign_out: 'Đăng xuất',
  games_title: 'Trò chơi mini',
  games_subtitle: 'Danh sách trò chơi học tập tương đương web.',
  games_alert_title: 'Trò chơi',
  games_alert_start: 'Bắt đầu {name}',
  game_mode_quiz_title: 'Quiz nhanh',
  game_mode_quiz_desc: 'Trả lời nhanh theo bộ thẻ đang học.',
  game_mode_memory_title: 'Ghép cặp',
  game_mode_memory_desc: 'Ghép cặp mặt trước/mặt sau để tăng trí nhớ.',
  game_mode_speed_title: 'Thử thách tốc độ',
  game_mode_speed_desc: 'Vượt giới hạn thời gian với chuỗi câu hỏi.',
  game_mode_word_scramble_title: 'Xếp chữ',
  game_mode_word_scramble_desc: 'Sắp xếp lại từ và cú pháp đúng.',
  notifications_title: 'Thông báo',
  notifications_mark_all_read: 'Đánh dấu tất cả đã đọc',
  notifications_empty: 'Không có thông báo mới',
  settings_title: 'Cài đặt',
  settings_language: 'Ngôn ngữ',
  profile_title: 'Hồ sơ',
  profile_display_name_placeholder: 'Tên hiển thị',
  profile_save: 'Lưu hồ sơ',
  review_title: 'Ôn tập',
  review_subtitle: 'Các thẻ đánh dấu sao hoặc độ khó cao',
  review_tab_all: 'Tất cả',
  review_tab_starred: 'Đánh dấu',
  review_tab_hard: 'Thẻ khó',
  review_stat_total: 'Cần ôn tập',
  review_stat_starred: 'Đánh dấu sao',
  review_stat_hard: 'Độ khó cao',
  review_stat_libraries: 'Thư viện',
  review_empty: 'Chưa có thẻ nào được đánh dấu để ôn tập.',
  review_empty_starred: 'Chưa đánh dấu sao thẻ nào.',
  review_empty_hard: 'Chưa có thẻ nào được đánh giá là khó.',
  review_cards_count: '{count} thẻ cần ôn tập',
  review_start: 'Bắt đầu ôn tập',
  review_badge_starred: 'Đánh dấu',
  review_badge_hard: 'Khó',
  review_unknown_library: 'Thư viện không xác định',
  nav_review: 'Ôn tập thẻ',
  more_menu_review: 'Ôn tập thẻ đánh dấu',

} as const;

type TranslationKey = keyof typeof vi;

const en: Record<TranslationKey, string> = {
  nav_auth_title: 'Sign in',
  nav_library_detail: 'Library detail',
  nav_note_detail: 'Note detail',
  nav_test_setup: 'Test setup',
  nav_test_session: 'Test session',
  nav_games: 'Games',
  nav_notifications: 'Notifications',
  nav_settings: 'Settings',
  nav_profile: 'Profile',
  tab_dashboard: 'Dashboard',
  tab_libraries: 'Libraries',
  tab_study: 'Study',
  tab_notes: 'Notes',
  tab_more: 'More',
  auth_title_sign_up: 'Create your SmartLearn account',
  auth_title_sign_in: 'Sign in to SmartLearn',
  auth_subtitle: 'Mobile shares the same Firebase data source with web.',
  auth_error_required: 'Please enter both email and password.',
  auth_error_password_min: 'Password must be at least 6 characters.',
  auth_error_confirm_mismatch: 'Password confirmation does not match.',
  auth_error_sign_in_failed: 'Sign in failed',
  auth_sign_in: 'Sign in',
  auth_sign_up: 'Sign up',
  auth_sign_in_google: 'Sign in with Google',
  auth_processing: 'Processing...',
  auth_field_display_name: 'Display name',
  auth_field_email: 'Email',
  auth_field_password: 'Password',
  auth_field_confirm_password: 'Confirm password',
  auth_terms: 'By signing in you accept our Terms & Privacy Policy.',
  dashboard_greeting: 'Hello, {name}!',
  dashboard_greeting_default: 'Welcome back!',
  dashboard_level_up: 'Level up your skills!',
  dashboard_continue: 'Continue learning today',
  dashboard_quick_stats: 'Quick stats',
  dashboard_quick_actions: 'Quick actions',
  dashboard_stat_libraries: 'Libraries',
  dashboard_stat_cards: 'Cards',
  dashboard_stat_due: 'Due',
  dashboard_stat_events: 'Events',
  dashboard_stat_unread: 'Unread',
  dashboard_stat_streak: 'Streak',
  dashboard_action_libraries: 'Library details',
  dashboard_action_study: 'Study and schedule',
  dashboard_action_test: 'Quick test',
  dashboard_action_games: 'Mini games',
  dashboard_productivity: '7-day productivity',
  dashboard_chart_focus: 'Focus',
  dashboard_chart_review: 'Review',
  dashboard_study_trend: 'Study trend',
  dashboard_mastery: 'Mastery level',
  dashboard_weekly_goal: 'Weekly goal',
  dashboard_library_progress: 'Library progress',
  libraries_create_new: 'Create a new library',
  libraries_name_placeholder: 'Library name',
  libraries_description_placeholder: 'Short description',
  libraries_create_button: 'Create library',
  libraries_all: 'All libraries',
  libraries_no_description: 'No description',
  libraries_card_count: '{count} cards',
  libraries_empty: 'No libraries yet',
  library_front_placeholder: 'Front',
  library_back_placeholder: 'Back',
  library_add_card: 'Add card',
  library_card_list: 'Card list',
  library_no_cards: 'No cards yet',
  notes_title: 'Study notes',
  notes_create: 'Create a new note',
  notes_list: 'Notes list',
  notes_empty_content: 'Tap to add note content',
  notes_default_title: 'New note',
  notes_empty: 'No notes yet',
  note_edit: 'Edit note',
  note_title_placeholder: 'Title',
  note_content_placeholder: 'Content',
  note_save: 'Save',
  note_saving: 'Saving...',
  note_updated_at: 'Updated: {time}',
  study_schedule: 'Study schedule',
  study_add_event_placeholder: 'Add study event',
  study_add_event: 'Add event',
  study_events: 'Events',
  study_status_upcoming: 'Upcoming',
  study_status_completed: 'Completed',
  study_status_missed: 'Missed',
  study_mark_completed: 'Completed',
  study_mark_missed: 'Missed',
  study_empty: 'No events yet',
  study_mode_title: 'Study mode',
  study_mode_start: 'Start studying',
  study_mode_no_cards: 'No cards in this library to study',
  more_title: 'More features',
  more_subtitle: 'All modules from web are available in mobile routes.',
  more_menu_test: 'Test',
  more_menu_games: 'Games',
  more_menu_notifications: 'Notifications',
  more_menu_settings: 'Settings',
  more_menu_profile: 'Profile',
  more_menu_sign_out: 'Sign out',
  games_title: 'Mini games',
  games_subtitle: 'Learning game modes equivalent to web.',
  games_alert_title: 'Game',
  games_alert_start: 'Start {name}',
  game_mode_quiz_title: 'Quick quiz',
  game_mode_quiz_desc: 'Answer quickly using the current card set.',
  game_mode_memory_title: 'Memory match',
  game_mode_memory_desc: 'Match front/back pairs to improve memory.',
  game_mode_speed_title: 'Speed challenge',
  game_mode_speed_desc: 'Beat the clock with rapid questions.',
  game_mode_word_scramble_title: 'Word scramble',
  game_mode_word_scramble_desc: 'Reorder words into the correct form.',
  notifications_title: 'Notifications',
  notifications_mark_all_read: 'Mark all as read',
  notifications_empty: 'No new notifications',
  settings_title: 'Settings',
  settings_language: 'Language',
  profile_title: 'Profile',
  profile_display_name_placeholder: 'Display name',
  profile_save: 'Save profile',
  review_title: 'Review',
  review_subtitle: 'Starred or hard-difficulty cards',
  review_tab_all: 'All',
  review_tab_starred: 'Starred',
  review_tab_hard: 'Hard',
  review_stat_total: 'To review',
  review_stat_starred: 'Starred',
  review_stat_hard: 'Hard',
  review_stat_libraries: 'Libraries',
  review_empty: 'No cards flagged for review yet.',
  review_empty_starred: 'No starred cards yet.',
  review_empty_hard: 'No hard-difficulty cards yet.',
  review_cards_count: '{count} cards to review',
  review_start: 'Start review',
  review_badge_starred: 'Starred',
  review_badge_hard: 'Hard',
  review_unknown_library: 'Unknown library',
  nav_review: 'Review cards',
  more_menu_review: 'Review flagged cards',
};

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  vi,
  en,
};

const localeByLanguage: Record<AppLanguage, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

type TranslationParams = Record<string, string | number>;

interface I18nContextValue {
  language: AppLanguage;
  locale: string;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  setLanguage: (language: AppLanguage) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, template);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [language, setLanguage] = useState<AppLanguage>('vi');

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setLanguage('vi');
      return () => {
        cancelled = true;
      };
    }

    userRepository
      .getSettings()
      .then((settings) => {
        if (!cancelled) {
          setLanguage(settings.language === 'en' ? 'en' : 'vi');
        }
      })
      .catch(() => {
        if (!cancelled) setLanguage('vi');
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      const value = translations[language][key] ?? key;
      return interpolate(value, params);
    },
    [language]
  );

  const contextValue = useMemo<I18nContextValue>(() => {
    return {
      language,
      locale: localeByLanguage[language],
      t,
      setLanguage,
    };
  }, [language, t]);

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}

