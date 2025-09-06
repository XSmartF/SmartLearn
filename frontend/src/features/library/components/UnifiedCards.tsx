import { Button } from "@/shared/components/ui/button"
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/components/ui/table'
import { Badge } from "@/shared/components/ui/badge"
import type { Card as EngineCard } from '@/shared/lib/models'

interface UnifiedCardsProps {
  cards: EngineCard[];
  rawState: unknown;
  viewMode: 'grid'|'list';
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
  onEdit: (card: EngineCard) => void;
  onDeleteSingle: (id: string) => void;
  canModify: boolean;
}

export function UnifiedCards({
  cards,
  rawState,
  viewMode,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDeleteSingle,
  canModify
}: UnifiedCardsProps) {
  interface CSLite { id: string; mastery?: number; seenCount?: number; wrongCount?: number; nextDue?: number }
  const map = new Map<string, CSLite>();
  if (rawState && typeof rawState === 'object' && Array.isArray((rawState as { states?: unknown }).states)) {
    for (const s of (rawState as { states: unknown[] }).states) {
      if (s && typeof s === 'object' && 'id' in s) {
        const cs = s as CSLite; map.set(cs.id, cs);
      }
    }
  }
  const allSelected = cards.length>0 && selectedIds.length===cards.length;
  if (!cards.length) return <div className="text-sm text-muted-foreground border rounded-md p-4">Chưa có thẻ.</div>;
  if (viewMode === 'list') {
    return (
      <div className="overflow-auto border rounded-md">
        <Table className="text-sm">
          <TableHeader className="bg-muted/40">
            <TableRow className="text-left">
              <TableHead className="p-2 w-8"><Checkbox checked={allSelected} onCheckedChange={(v)=>onSelectAll(!!v)} aria-label="Chọn tất cả" /></TableHead>
              <TableHead className="p-2 w-1/4">Mặt trước</TableHead>
              <TableHead className="p-2 w-1/4">Mặt sau</TableHead>
              <TableHead className="p-2">Domain</TableHead>
              <TableHead className="p-2">Khó</TableHead>
              <TableHead className="p-2">Mastery</TableHead>
              <TableHead className="p-2">Seen</TableHead>
              <TableHead className="p-2">Sai</TableHead>
              <TableHead className="p-2">Due</TableHead>
              <TableHead className="p-2 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map(c=>{
              const st = map.get(c.id);
              return (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell className="p-2"><Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={()=>onToggleSelect(c.id)} aria-label="Chọn thẻ" /></TableCell>
                  <TableCell className="p-2 truncate" title={c.front}>{c.front}</TableCell>
                  <TableCell className="p-2 truncate" title={c.back}>{c.back}</TableCell>
                  <TableCell className="p-2 text-xs">{c.domain || '-'}</TableCell>
                  <TableCell className="p-2 text-xs">{c.difficulty || '-'}</TableCell>
                  <TableCell className="p-2 text-center">{st?.mastery ?? '-'}</TableCell>
                  <TableCell className="p-2 text-center">{st?.seenCount ?? '-'}</TableCell>
                  <TableCell className="p-2 text-center">{st?.wrongCount ?? '-'}</TableCell>
                  <TableCell className="p-2 text-center">{st?.nextDue ?? '-'}</TableCell>
                  <TableCell className="p-2 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={()=>onEdit(c)} disabled={!canModify}>Sửa</Button>
                    <Button variant="destructive" size="sm" onClick={()=>onDeleteSingle(c.id)} disabled={!canModify}>Xóa</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
  // Grid mode
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map(c=>{
        const st = map.get(c.id);
        const selected = selectedIds.includes(c.id);
        return (
          <div key={c.id} className={`border rounded-md p-3 flex flex-col gap-2 relative group bg-background hover:shadow-sm transition ${selected? 'ring-2 ring-blue-500':''}`}>
            <div className="flex items-start gap-2">
              <Checkbox className="mt-1" checked={selected} onCheckedChange={()=>onToggleSelect(c.id)} aria-label="Chọn thẻ" />
              <div className="flex-1">
                <div className="font-medium text-sm line-clamp-2" title={c.front}>{c.front}</div>
                <div className="text-xs text-muted-foreground line-clamp-2" title={c.back}>{c.back}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {c.domain && <Badge variant="outline" className="px-1 py-0 text-[10px]">{c.domain}</Badge>}
              {c.difficulty && <Badge variant="secondary" className="px-1 py-0 text-[10px]">{c.difficulty}</Badge>}
              {typeof st?.mastery === 'number' && <Badge className="px-1 py-0 bg-blue-600 text-white">M{st.mastery}</Badge>}
              {typeof st?.seenCount === 'number' && <Badge variant="outline" className="px-1 py-0">S{st.seenCount}</Badge>}
              {typeof st?.wrongCount === 'number' && st.wrongCount>0 && <Badge variant="destructive" className="px-1 py-0">W{st.wrongCount}</Badge>}
              {typeof st?.nextDue === 'number' && <Badge variant="outline" className="px-1 py-0">D{st.nextDue}</Badge>}
            </div>
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
              <Button size="sm" variant="outline" className="h-7 px-2" onClick={()=>onEdit(c)} disabled={!canModify}>Sửa</Button>
              <Button size="sm" variant="destructive" className="h-7 px-2" onClick={()=>onDeleteSingle(c.id)} disabled={!canModify}>Xóa</Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
