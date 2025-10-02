import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { H1 } from '@/shared/components/ui/typography'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Switch } from '@/shared/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { ArrowLeft, Settings, RotateCcw, BarChart3, Save, FlipHorizontal2 } from 'lucide-react'
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
  answerSide: 'front' | 'back'
  setAllowMC: (value: boolean) => void
  setAllowTyped: (value: boolean) => void
  setAutoAdvance: (value: boolean) => void
  setShowCardProgress: (value: boolean) => void
  setAutoRead: (value: boolean) => void
  setReadLanguage: (value: string) => void
  setShowKeyboardShortcuts: (value: boolean) => void
  setAnswerSide: (side: 'front' | 'back') => void
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
  answerSide,
  setAllowMC,
  setAllowTyped,
  setAutoAdvance,
  setShowCardProgress,
  setAutoRead,
  setReadLanguage,
  setShowKeyboardShortcuts,
  setAnswerSide,
  handleResetSession
}: StudyHeaderProps) {
  return (
    <div className='bg-card/80 backdrop-blur-sm border-b border-border'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0'>
          <div className='flex items-center space-x-4'>
            <Link to={getLibraryDetailPath(libraryId)}>
              <Button variant='ghost' size='icon' className='hover:bg-accent'>
                <ArrowLeft className='h-5 w-5'/>
              </Button>
            </Link>
            <div>
              <H1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
                Học với {library.title}
              </H1>
              <p className='text-muted-foreground text-sm sm:text-base'>
                Thuật toán thích ứng - {currentQuestion?.mode === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Đánh máy'}
              </p>
            </div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' size='icon' className='hover:bg-accent'>
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
                    <label className='text-sm flex items-center gap-2'>
                      <FlipHorizontal2 className='h-4 w-4 opacity-70' />
                      Trả lời bằng
                    </label>
                    <div className='flex rounded-md overflow-hidden border'>
                      <Button
                        type='button'
                        variant={answerSide === 'back' ? 'default' : 'ghost'}
                        size='sm'
                        className='rounded-none'
                        onClick={() => setAnswerSide('back')}
                      >
                        Mặt sau
                      </Button>
                      <Button
                        type='button'
                        variant={answerSide === 'front' ? 'default' : 'ghost'}
                        size='sm'
                        className='rounded-none'
                        onClick={() => setAnswerSide('front')}
                      >
                        Mặt trước
                      </Button>
                    </div>
                  </div>
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
                    className='w-full justify-start hover:bg-destructive/10 hover:border-destructive'
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
                <div className='text-xs text-muted-foreground bg-primary/10 p-2 rounded'>
                  <Save className="h-3 w-3 inline mr-1" />
                  Phiên được tự động lưu
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
