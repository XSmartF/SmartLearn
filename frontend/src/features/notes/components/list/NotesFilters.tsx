import type { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { NoteSortId, NoteSortOption } from '../../types';

interface NotesFiltersProps {
  searchQuery: string;
  sortId: NoteSortId;
  sortOptions: NoteSortOption[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: NoteSortId) => void;
}

export function NotesFilters({ searchQuery, sortId, sortOptions, onSearchChange, onSortChange }: NotesFiltersProps) {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm ghi chép..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>
      <Select value={sortId} onValueChange={(value) => onSortChange(value as NoteSortId)}>
        <SelectTrigger className="w-full sm:w-48">
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
  );
}
