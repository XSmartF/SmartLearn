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
  setAllowMC: (value: boolean) => void
  setAllowTyped: (value: boolean) => void
  setAutoAdvance: (value: boolean) => void
  setShowCardProgress: (value: boolean) => void
  setAutoRead: (value: boolean) => void
  setReadLanguage: (value: string) => void
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
  setAllowMC,
  setAllowTyped,
  setAutoAdvance,
  setShowCardProgress,
  setAutoRead,
  setReadLanguage,
  handleResetSession
}: StudyHeaderProps) {
  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0'>
      <div className='flex items-center space-x-4'>
        <Link to={getLibraryDetailPath(libraryId)}>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='h-4 w-4'/>
          </Button>
        </Link>
        <div>
          <H1 className='text-2xl sm:text-3xl font-bold'>Học với {library.title}</H1>
          <p className='text-muted-foreground'>
            Thuật toán thích ứng - {currentQuestion?.mode === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Đánh máy'}
          </p>
        </div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' size='icon'>
            <Settings className='h-4 w-4'/>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-72 sm:w-80' align='end'>
          <div className='space-y-3 sm:space-y-4'>
            <div className='space-y-1'>
              <div className='text-sm font-medium'>Tùy chọn học tập</div>
            </div>
            <div className='space-y-2 sm:space-y-3'>
              <Switch
                checked={allowMC}
                onCheckedChange={v => setAllowMC(!!v)}
                label='Trắc nghiệm'
              />
              <Switch
                checked={allowTyped}
                onCheckedChange={v => setAllowTyped(!!v)}
                label='Viết đáp án'
              />
              <Switch
                checked={autoAdvance}
                onCheckedChange={v => setAutoAdvance(!!v)}
                label='Tự chuyển câu'
              />
              <Switch
                checked={autoRead}
                onCheckedChange={v => setAutoRead(!!v)}
                label='Tự động đọc câu hỏi'
              />
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Ngôn ngữ đọc</label>
                <Select value={readLanguage} onValueChange={setReadLanguage}>
                  <SelectTrigger>
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
            <div className='pt-2 border-t space-y-2 sm:space-y-3'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleResetSession}
                className='w-full justify-start'
              >
                <RotateCcw className='h-4 w-4 mr-2'/>
                Reset phiên
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowCardProgress(!showCardProgress)}
                className='w-full justify-start'
              >
                <BarChart3 className='h-4 w-4 mr-2'/>
                {showCardProgress ? 'Ẩn chi tiết' : 'Xem chi tiết'}
              </Button>
            </div>
            <div className='text-xs text-muted-foreground'>Phiên được tự động lưu.</div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
