import { Link } from 'react-router-dom'
import { H1 } from '@/shared/components/ui/typography'
import { Button } from "@/shared/components/ui/button"
import { ArrowLeft, Heart, Share2, Download, Trash2 } from "lucide-react"
import type { LibraryMeta } from '@/shared/lib/models'
import { ROUTES } from '@/shared/constants/routes'

interface LibraryHeaderProps {
  library: LibraryMeta | null
  isFavorite: boolean
  onToggleFavorite: () => void
  onShareClick: () => void
  onDownloadClick: () => void
  onDeleteClick?: () => void
  canModify: boolean
}

export default function LibraryHeader({
  library,
  isFavorite,
  onToggleFavorite,
  onShareClick,
  onDownloadClick,
  onDeleteClick,
  canModify
}: LibraryHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={ROUTES.MY_LIBRARY}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <H1 className="text-3xl font-bold">{library?.title}</H1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>

          {canModify && (
            <>
              <Button variant="ghost" size="icon" title="Chia sẻ" onClick={onShareClick}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Tải xuống" onClick={onDownloadClick}>
                <Download className="h-4 w-4" />
              </Button>
              {onDeleteClick && (
                <Button variant="ghost" size="icon" title="Xóa" onClick={onDeleteClick}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
