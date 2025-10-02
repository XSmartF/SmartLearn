import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cardFlagRepository, type CardFlag } from '@/shared/lib/repositories/CardFlagRepository'
import { cardRepository } from '@/shared/lib/repositories/CardRepository'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import type { Card as EngineCard, LibraryMeta } from '@/shared/lib/models'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Loader } from '@/shared/components/ui/loader'
import { toast } from 'sonner'
import { Sparkles, Star, Flame, Library as LibraryIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getStudyPath } from '@/shared/constants/routes'
import { setReviewSession } from '@/shared/constants/review'

interface ReviewEntry {
  flag: CardFlag
  card?: EngineCard | null
  library?: LibraryMeta | null
}

const BADGE_STAR = 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/30'
const BADGE_HARD = 'bg-red-500/15 text-red-500 border border-red-500/30'

export default function ReviewPage() {
  const [flags, setFlags] = useState<CardFlag[]>([])
  const [loadingFlags, setLoadingFlags] = useState(true)
  const [cardCache, setCardCache] = useState<Record<string, EngineCard | null>>({})
  const [libraryCache, setLibraryCache] = useState<Record<string, LibraryMeta | null>>({})
  const navigate = useNavigate()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    setLoadingFlags(true)
    try {
      unsubscribe = cardFlagRepository.listenReviewFlags((records) => {
        setFlags(records)
        setLoadingFlags(false)
      })
    } catch (error) {
      console.error('Không thể tải dữ liệu ôn tập:', error)
      setLoadingFlags(false)
    }
    return () => {
      unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    const missingCards = Array.from(new Set(flags.map((flag) => flag.cardId))).filter(
      (cardId) => cardCache[cardId] === undefined
    )
    if (!missingCards.length) return

    let cancelled = false
    ;(async () => {
      const entries = await Promise.all(
        missingCards.map(async (cardId) => {
          const card = await cardRepository.getCard(cardId)
          return { cardId, card }
        })
      )
      if (cancelled) return
      setCardCache((prev) => {
        const next = { ...prev }
        entries.forEach(({ cardId, card }) => {
          next[cardId] = card
        })
        return next
      })
    })().catch((error) => {
      console.error('Không thể tải dữ liệu thẻ:', error)
    })

    return () => {
      cancelled = true
    }
  }, [flags, cardCache])

  useEffect(() => {
    const missingLibraries = Array.from(new Set(flags.map((flag) => flag.libraryId))).filter(
      (libraryId) => libraryCache[libraryId] === undefined
    )
    if (!missingLibraries.length) return

    let cancelled = false
    ;(async () => {
      try {
        const libs = await libraryRepository.fetchLibrariesByIds(missingLibraries)
        if (cancelled) return
        const found = new Set(libs.map((lib) => lib.id))
        setLibraryCache((prev) => {
          const next = { ...prev }
          libs.forEach((lib) => {
            next[lib.id] = lib
          })
          missingLibraries.forEach((id) => {
            if (!found.has(id) && next[id] === undefined) next[id] = null
          })
          return next
        })
      } catch (error) {
        console.error('Không thể tải thông tin thư viện:', error)
        setLibraryCache((prev) => {
          const next = { ...prev }
          missingLibraries.forEach((id) => {
            if (next[id] === undefined) next[id] = null
          })
          return next
        })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [flags, libraryCache])

  const reviewItems = useMemo<ReviewEntry[]>(
    () =>
      flags.map((flag) => ({
        flag,
        card: cardCache[flag.cardId],
        library: libraryCache[flag.libraryId] ?? null,
      })),
    [flags, cardCache, libraryCache]
  )

  const starredItems = useMemo(() => reviewItems.filter((item) => item.flag.starred === true), [reviewItems])
  const hardItems = useMemo(() => reviewItems.filter((item) => item.flag.difficulty === 'hard'), [reviewItems])

  const readyCount = reviewItems.filter((item) => item.card).length
  const starredCount = starredItems.filter((item) => item.card).length
  const hardCount = hardItems.filter((item) => item.card).length
  const libraryCount = useMemo(() => new Set(reviewItems.map((item) => item.flag.libraryId)).size, [reviewItems])
  const anyReady = readyCount > 0

  const handleReview = (entries: ReviewEntry[]) => {
    const ready = entries.filter((entry) => entry.card && entry.library)
    if (!ready.length) {
      toast.info('Không có thẻ sẵn sàng ôn tập')
      return
    }
    const libraryIds = Array.from(new Set(ready.map((entry) => entry.flag.libraryId)))

    if (libraryIds.length > 1) {
      toast.warning('Để ôn tập trên trang học, vui lòng chọn từng thư viện một.')
      return
    }

    const libraryId = libraryIds[0]
    if (!libraryId) {
      toast.error('Không xác định được thư viện của thẻ ôn tập')
      return
    }

    const cardIds = ready.map((entry) => entry.flag.cardId)
    setReviewSession({ libraryId, cardIds })
    navigate(`${getStudyPath(libraryId)}?mode=review`)
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      <PageHeader
        title="Ôn tập thông minh"
        description="Tập trung luyện lại các thẻ bạn đã đánh dấu quan trọng hoặc đánh giá là khó trong quá trình học."
        eyebrow="Chế độ ôn tập"
        icon={<Sparkles className="h-5 w-5 text-primary" />}
        actions={
          <>
            <Button size="lg" onClick={() => handleReview(reviewItems)} disabled={!anyReady}>
              Ôn tập tất cả ({readyCount})
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleReview(hardItems)}
              disabled={!hardCount}
            >
              Ôn tập thẻ khó ({hardCount})
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => handleReview(starredItems)}
              disabled={!starredCount}
            >
              Ôn tập thẻ đánh dấu ({starredCount})
            </Button>
          </>
        }
      />

      <Card className="border border-border/60 bg-card/60 shadow-sm">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReviewStat
            icon={Sparkles}
            label="Thẻ cần ôn tập"
            value={readyCount}
            accent="text-primary"
          />
          <ReviewStat icon={Star} label="Đánh dấu sao" value={starredCount} accent="text-yellow-500" />
          <ReviewStat icon={Flame} label="Độ khó cao" value={hardCount} accent="text-red-500" />
          <ReviewStat icon={LibraryIcon} label="Thư viện liên quan" value={libraryCount} accent="text-info" />
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto rounded-full bg-muted/40 p-1 gap-2">
          <TabsTrigger value="all" className="flex items-center gap-2 flex-shrink-0 min-w-[120px] rounded-full px-3 py-1.5 text-sm font-medium data-[state=active]:scale-100">
            Tất cả
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {readyCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="star" className="flex items-center gap-2 flex-shrink-0 min-w-[140px] rounded-full px-3 py-1.5 text-sm font-medium data-[state=active]:scale-100">
            Đánh dấu sao
            <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[11px] font-semibold text-yellow-600">
              {starredCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="hard" className="flex items-center gap-2 flex-shrink-0 min-w-[120px] rounded-full px-3 py-1.5 text-sm font-medium data-[state=active]:scale-100">
            Thẻ khó
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-500">
              {hardCount}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <ReviewList
            items={reviewItems}
            loading={loadingFlags}
            emptyMessage="Chưa có thẻ nào được đánh dấu để ôn tập. Trong quá trình học, hãy đánh dấu ⭐ hoặc chọn mức Khó để lưu lại thẻ quan trọng."
            onReview={handleReview}
          />
        </TabsContent>
        <TabsContent value="star" className="space-y-4">
          <ReviewList
            items={starredItems}
            loading={loadingFlags}
            emptyMessage="Bạn chưa đánh dấu thẻ nào. Khi học, hãy nhấp vào biểu tượng ⭐ để lưu những thẻ cần xem lại."
            onReview={handleReview}
          />
        </TabsContent>
        <TabsContent value="hard" className="space-y-4">
          <ReviewList
            items={hardItems}
            loading={loadingFlags}
            emptyMessage='Chưa có thẻ được đánh giá là khó. Chọn mức "Khó" khi đánh giá độ khó để thêm vào danh sách này.'
            onReview={handleReview}
          />
        </TabsContent>
      </Tabs>

    </div>
  )
}

interface ReviewStatProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  accent?: string
}

function ReviewStat({ icon: Icon, label, value, accent }: ReviewStatProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/80 p-3">
      <span className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary', accent)}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

interface ReviewListProps {
  items: ReviewEntry[]
  loading: boolean
  emptyMessage: string
  onReview: (entries: ReviewEntry[]) => void
}

function ReviewList({ items, loading, emptyMessage, onReview }: ReviewListProps) {
  const isLoading = loading || items.some((item) => item.card === undefined)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-12">
        <Loader size="sm" label="Đang chuẩn bị dữ liệu ôn tập" />
      </div>
    )
  }

  const readyItems = items.filter((item) => item.card)
  const missingItems = items.filter((item) => item.card === null)

  if (!readyItems.length) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
        {missingItems.length ? (
          <p className="mt-2 text-xs text-muted-foreground/70">
            {missingItems.length} thẻ không còn khả dụng do đã bị xoá hoặc bạn không còn quyền truy cập.
          </p>
        ) : null}
      </div>
    )
  }

  const grouped = Array.from(
    readyItems.reduce((acc, item) => {
      const key = item.flag.libraryId
      const bucket = acc.get(key) ?? { library: item.library, cards: [] as ReviewEntry[] }
      bucket.cards.push(item)
      bucket.library = item.library ?? bucket.library
      acc.set(key, bucket)
      return acc
    }, new Map<string, { library: LibraryMeta | null | undefined; cards: ReviewEntry[] }>())
  ).map(([libraryId, value]) => ({ libraryId, ...value }))

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <Card key={group.libraryId} className="border border-border/50 bg-card/70 shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                {group.library?.title ?? 'Thư viện không xác định'}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{group.cards.length} thẻ cần ôn tập</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => onReview(group.cards)}>
              Ôn tập nhóm này
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {group.cards.map((item) => (
              <div
                key={item.flag.cardId}
                className="flex flex-col gap-3 rounded-lg border border-border/40 bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{item.card?.front}</p>
                  <p className="text-xs text-muted-foreground">{item.card?.back}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {item.flag.starred === true ? (
                    <Badge variant="outline" className={cn('gap-1', BADGE_STAR)}>
                      <Star className="h-3 w-3" /> Đánh dấu
                    </Badge>
                  ) : null}
                  {item.flag.difficulty === 'hard' ? (
                    <Badge variant="outline" className={cn('gap-1', BADGE_HARD)}>
                      <Flame className="h-3 w-3" /> Khó
                    </Badge>
                  ) : null}
                  <Button size="sm" variant="ghost" onClick={() => onReview([item])}>
                    Ôn tập thẻ
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      {missingItems.length ? (
        <div className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-4 text-xs text-destructive">
          {missingItems.length} thẻ không thể tải được. Có thể chúng đã bị xoá hoặc bạn mất quyền truy cập.
        </div>
      ) : null}
    </div>
  )
}
