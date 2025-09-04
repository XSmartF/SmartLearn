import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export interface CardPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function CardPagination({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions = [10,20,30,50], className }: CardPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className={`flex items-center justify-between gap-4 text-xs ${className||''}`}> 
      <div className="flex items-center gap-2">Trang
        <Button variant="outline" size="sm" disabled={page===1} onClick={()=>onPageChange(page-1)}>Trước</Button>
        <span>{page}/{totalPages}</span>
        <Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>onPageChange(page+1)}>Sau</Button>
      </div>
      <div className="flex items-center gap-1">Hiển thị
        {onPageSizeChange && (
          <Select value={String(pageSize)} onValueChange={(v: string)=> onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-7 w-[70px] text-xs px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(s=> <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        thẻ / trang
      </div>
    </div>
  );
}

// Below: generic shadcn-like pagination primitives (kept intact)
