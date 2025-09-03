import { Button } from '@/components/ui/button';

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
          <select className="border rounded px-1 py-0.5 bg-background" value={pageSize} onChange={e=> onPageSizeChange(Number(e.target.value))}>
            {pageSizeOptions.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        thẻ / trang
      </div>
    </div>
  );
}

// Below: generic shadcn-like pagination primitives (kept intact)
