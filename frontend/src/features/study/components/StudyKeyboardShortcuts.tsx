import { Alert, AlertTitle } from '@/shared/components/ui/alert'
import type { KeyboardShortcutDescriptor } from '@/features/study/constants/shortcuts'

interface StudyKeyboardShortcutsProps {
  shortcuts: KeyboardShortcutDescriptor[]
}

export function StudyKeyboardShortcuts({ shortcuts }: StudyKeyboardShortcutsProps) {
  return (
    <Alert className="border-info bg-info/10">
      <AlertTitle className="text-info flex items-center gap-2">
        ⌨️ Phím tắt bàn phím
      </AlertTitle>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        {shortcuts.map(shortcut => (
          <div key={shortcut.keys} className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-info/20 text-info rounded text-xs font-mono">
              {shortcut.keys}
            </kbd>
            <span className="text-info">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </Alert>
  )
}
