import { useState, useEffect } from 'react'
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select"
import { userRepository } from '@/shared/lib/repositories/UserRepository'
import { UserPlus } from "lucide-react"
import ConfirmDialog from "@/shared/components/ConfirmDialog"

interface ShareManagerProps {
  libraryId: string;
  shares: { id: string; libraryId: string; grantedBy: string; targetUserId: string; role: 'viewer'|'contributor'; createdAt: string }[];
  loading: boolean;
  currentUserId: string;
  ownerId: string;
  inviteEmail: string;
  onInviteEmailChange: (v: string)=>void;
  inviteRole: 'viewer'|'contributor';
  onInviteRoleChange: (r: 'viewer'|'contributor')=>void;
  onInvite: (userId: string, role: 'viewer'|'contributor')=>Promise<void>;
  removeShare: (shareId: string)=>Promise<void>;
  updateRole: (shareId: string, role: 'viewer'|'contributor')=>Promise<void>;
  searching: boolean;
  searchResults: { id: string; email?: string; displayName?: string }[];
  inviteLoading: boolean;
}

export function ShareManager(props: ShareManagerProps) {
  const { shares, loading, ownerId, currentUserId, inviteEmail, onInviteEmailChange, inviteRole, onInviteRoleChange, onInvite, removeShare, updateRole, searching, searchResults, inviteLoading } = props;
  const isOwner = ownerId === currentUserId;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium">Mời bằng email</label>
        <div className="flex gap-2 items-center">
          <Input placeholder="user@example.com" value={inviteEmail} onChange={e=>onInviteEmailChange(e.target.value)} className="flex-1" />
          <Select value={inviteRole} onValueChange={(v: string)=>onInviteRoleChange(v as 'viewer'|'contributor')}>
            <SelectTrigger className="h-9 text-sm w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="contributor">Contributor</SelectItem>
            </SelectContent>
          </Select>
          <Button disabled={!inviteEmail || inviteLoading || searching} onClick={async()=>{
            if (!searchResults.length) return; // require exact email match result
            const user = searchResults[0];
            await onInvite(user.id, inviteRole);
          }}>{inviteLoading? 'Đang mời...' : 'Mời'}</Button>
        </div>
        {searching && <div className="text-xs text-muted-foreground">Đang tìm...</div>}
        {!searching && inviteEmail && searchResults.length === 0 && <div className="text-xs text-red-500">Không tìm thấy người dùng</div>}
        {!searching && searchResults.length > 0 && (
          <div className="border rounded p-2 max-h-32 overflow-auto space-y-1 bg-muted/30 text-xs">
            {searchResults.map(u => (
              <div key={u.id} className="flex justify-between items-center">
                <span>{u.displayName || u.email || u.id}</span>
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={async()=>{ await onInvite(u.id, inviteRole); }} disabled={inviteLoading}>Chọn</Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium flex items-center gap-2"><UserPlus className="h-4 w-4" /> Người được chia sẻ</div>
        {loading ? <div className="text-xs text-muted-foreground">Đang tải...</div> : (
          <div className="border rounded-md divide-y">
            {shares.length === 0 && <div className="p-3 text-xs text-muted-foreground">Chưa chia sẻ cho ai.</div>}
            {shares.map(s => (
              <ShareRow key={s.id} share={s} isOwner={isOwner} updateRole={updateRole} removeShare={removeShare} />
            ))}
          </div>
        )}
      </div>
      {!isOwner && <div className="text-[10px] text-muted-foreground">Chỉ chủ sở hữu mới chỉnh sửa role.</div>}
    </div>
  );
}

function ShareRow({ share, isOwner, updateRole, removeShare }: { share: { id: string; targetUserId: string; role: 'viewer'|'contributor'; grantedBy: string; libraryId: string; createdAt: string }; isOwner: boolean; updateRole: (id: string, r: 'viewer'|'contributor')=>Promise<void>; removeShare: (id: string)=>Promise<void>; }) {
  const [profile, setProfile] = useState<{ id: string; email?: string; displayName?: string }|null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    setUpdating(true);
    try {
      await removeShare(share.id);
      setDeleteDialogOpen(false);
    } finally {
      setUpdating(false);
    }
  };
  useEffect(()=>{ let cancelled=false; (async()=>{ setLoadingProfile(true); try { const p = await userRepository.getUserProfile(share.targetUserId); if(!cancelled) setProfile(p); } finally { if(!cancelled) setLoadingProfile(false);} })(); return ()=>{cancelled=true}; }, [share.targetUserId]);
  return (
    <>
      <div className="p-3 flex items-center gap-3 text-xs">
        <div className="flex-1">
          <div className="font-medium">
            {loadingProfile ? '...' : (profile?.displayName || profile?.email || share.targetUserId)}
          </div>
          <div className="text-[10px] text-muted-foreground">Role: {share.role}</div>
        </div>
        {isOwner ? (
    <Select value={share.role} onValueChange={async (v: string)=>{ const val = v as 'viewer'|'contributor'; setUpdating(true); try { await updateRole(share.id, val);} finally { setUpdating(false);} }}>
            <SelectTrigger className="h-7 text-xs w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="contributor">Contributor</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="text-muted-foreground text-[11px]">{share.role}</span>
        )}
        {isOwner && (
          <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => setDeleteDialogOpen(true)} disabled={updating}>Xóa</Button>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hủy chia sẻ"
        description="Bạn có chắc chắn muốn hủy chia sẻ thư viện này không?"
        onConfirm={handleDeleteConfirm}
        confirmText="Hủy chia sẻ"
        cancelText="Giữ lại"
        variant="destructive"
      >
        <div />
      </ConfirmDialog>
    </>
  );
}
