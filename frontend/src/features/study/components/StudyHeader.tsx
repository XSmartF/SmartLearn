import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { H1 } from '@/shared/components/ui/typography'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Switch } from '@/shared/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { ArrowLeft, Settings, RotateCcw, BarChart3 } from 'lucide-react'
import type { Question } from '@/features/study/utils/learnEngine'
import type { LibraryMeta } from '@/shared/lib/models'
import { getLibraryDetailPath } from '@/shared/constants/routes'

interface StudyHeaderProps {
  library: LibraryMeta
  libraryId: string
  currentQuestion: Question | null
  allowMC: boolean
  allowTyped: boolean
  autoAdvance: boolean
  showCardProgress: boolean
  autoRead: boolean
  readLanguage: string
  showKeyboardShortcuts: boolean
  setAllowMC: (value: boolean) => void
  setAllowTyped: (value: boolean) => void
  setAutoAdvance: (value: boolean) => void
  setShowCardProgress: (value: boolean) => void
  setAutoRead: (value: boolean) => void
  setReadLanguage: (value: string) => void
  setShowKeyboardShortcuts: (value: boolean) => void
  handleResetSession: () => void
}

export function StudyHeader({
  library,
  libraryId,
  currentQuestion,
  allowMC,
  allowTyped,
  autoAdvance,
  showCardProgress,
  autoRead,
  readLanguage,
  showKeyboardShortcuts,
  setAllowMC,
  setAllowTyped,
  setAutoAdvance,
  setShowCardProgress,
  setAutoRead,
  setReadLanguage,
  setShowKeyboardShortcuts,
  handleResetSession
}: StudyHeaderProps) {
  return (
    <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0'>
          <div className='flex items-center space-x-4'>
            <Link to={getLibraryDetailPath(libraryId)}>
              <Button variant='ghost' size='icon' className='hover:bg-gray-100 dark:hover:bg-gray-700'>
                <ArrowLeft className='h-5 w-5'/>
              </Button>
            </Link>
            <div>
              <H1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                Học với {library.title}
              </H1>
              <p className='text-muted-foreground text-sm sm:text-base'>
                Thuật toán thích ứng - {currentQuestion?.mode === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Đánh máy'}
              </p>
            </div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' size='icon' className='hover:bg-gray-100 dark:hover:bg-gray-700'>
                <Settings className='h-5 w-5'/>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80' align='end'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <div className='text-sm font-semibold'>Tùy chọn học tập</div>
                  <p className='text-xs text-muted-foreground'>Điều chỉnh cách bạn muốn học</p>
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm'>Trắc nghiệm</label>
                    <Switch
                      checked={allowMC}
                      onCheckedChange={v => setAllowMC(!!v)}
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm'>Viết đáp án</label>
                    <Switch
                      checked={allowTyped}
                      onCheckedChange={v => setAllowTyped(!!v)}
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm'>Tự chuyển câu</label>
                    <Switch
                      checked={autoAdvance}
                      onCheckedChange={v => setAutoAdvance(!!v)}
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm'>Tự động đọc</label>
                    <Switch
                      checked={autoRead}
                      onCheckedChange={v => setAutoRead(!!v)}
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm'>Hiển thị phím tắt</label>
                    <Switch
                      checked={showKeyboardShortcuts}
                      onCheckedChange={v => setShowKeyboardShortcuts(!!v)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Ngôn ngữ đọc</label>
                    <Select value={readLanguage} onValueChange={setReadLanguage}>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='en-US'>English (US)</SelectItem>
                        <SelectItem value='en-GB'>English (UK)</SelectItem>
                        <SelectItem value='vi-VN'>Tiếng Việt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='pt-3 border-t space-y-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleResetSession}
                    className='w-full justify-start hover:bg-red-50 hover:border-red-200'
                  >
                    <RotateCcw className='h-4 w-4 mr-2'/>
                    Reset phiên học
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShowCardProgress(!showCardProgress)}
                    className='w-full justify-start'
                  >
                    <BarChart3 className='h-4 w-4 mr-2'/>
                    {showCardProgress ? 'Ẩn chi tiết thẻ' : 'Xem chi tiết thẻ'}
                  </Button>
                </div>
                <div className='text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded'>
                  💾 Phiên được tự động lưu
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
