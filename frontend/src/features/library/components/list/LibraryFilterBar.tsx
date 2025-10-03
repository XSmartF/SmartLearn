import type { ChangeEvent } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import type { LibrarySortId, LibrarySortOption, LibraryViewMode } from '../../types';

interface LibraryFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortId: LibrarySortId;
  sortOptions: LibrarySortOption[];
  onSortChange: (value: LibrarySortId) => void;
  viewMode: LibraryViewMode;
  onViewModeChange: (mode: LibraryViewMode) => void;
  totalCount: number;
  filteredCount: number;
}

export function LibraryFilterBar({
  searchQuery,
  onSearchChange,
  sortId,
  sortOptions,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
}: LibraryFilterBarProps) {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="flex flex-col gap-4 rounded-md bg-muted/20 p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Tìm kiếm thư viện..."
            className="pl-10"
          />
        </div>
        <Select value={sortId} onValueChange={(value) => onSortChange(value as LibrarySortId)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <p className="text-xs text-muted-foreground">
          Đang xem {filteredCount} / {totalCount} thư viện
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-card/70 p-1 shadow-sm">
          <Button
            type="button"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onViewModeChange('grid')}
            className="h-9 w-9"
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onViewModeChange('list')}
            className="h-9 w-9"
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
