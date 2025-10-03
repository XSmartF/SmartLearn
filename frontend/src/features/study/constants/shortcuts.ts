export type KeyboardShortcutDescriptor = {
  keys: string
  description: string
}

export const STUDY_KEYBOARD_SHORTCUTS: KeyboardShortcutDescriptor[] = [
  { keys: '1-4', description: 'Chọn đáp án trắc nghiệm' },
  { keys: 'Enter', description: 'Gửi câu trả lời' },
  { keys: 'Space/→', description: 'Chuyển sang câu hỏi tiếp theo' },
  { keys: 'Esc', description: 'Xóa câu trả lời đang nhập' },
  { keys: 'R', description: 'Reset phiên học tập' },
  { keys: 'S', description: 'Bật / tắt đọc tự động' },
  { keys: 'D hoặc Q', description: 'Đọc câu hỏi hiện tại' }
]
