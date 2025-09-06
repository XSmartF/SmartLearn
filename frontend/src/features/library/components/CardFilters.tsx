import { Input } from '@/shared/components/ui/input'
import { Button } from "@/shared/components/ui/button"
import { Search, LayoutGrid, List as ListIcon } from "lucide-react"

interface CardFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  totalCards: number
  filteredCount: number
}

export default function CardFilters({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  totalCards,
  filteredCount
}: CardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center space-x-2 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thẻ..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredCount} / {totalCards} thẻ
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-l-none"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
