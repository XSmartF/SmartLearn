import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'sonner'
import { ArrowLeft, Save, Star } from "lucide-react"
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/shadcn/style.css";
import { useNote, useNoteFavorites } from '@/shared/hooks/useNotes'
import { noteRepository } from '@/shared/lib/repositories/NoteRepository'
import { Loader } from '@/shared/components/ui/loader'

export default function NoteDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { note, loading, error } = useNote(id || '');
    const { favorites, toggleFavorite: toggleFav } = useNoteFavorites();
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const editor = useCreateBlockNote({
        initialContent: note?.content ? JSON.parse(note.content) : undefined,
    });

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setIsFavorite(favorites.includes(note.id));
            if (note.content) {
                editor.replaceBlocks(editor.document, JSON.parse(note.content));
            }
        }
    }, [note, editor, favorites]);

    const handleSave = async () => {
        if (!note) return;
        setSaving(true);
        try {
            const content = JSON.stringify(editor.document);
            await noteRepository.updateNote(note.id, {
                title,
                content
            });
            toast.success('Đã lưu ghi chép');
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi lưu');
        } finally {
            setSaving(false);
        }
    };

    const toggleFavorite = async () => {
        if (!note) return;
        try {
            await toggleFav(note.id, isFavorite);
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader label="Đang tải ghi chép" />
            </div>
        );
    }

    if (error || !note) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-muted-foreground mb-2">Không tìm thấy ghi chép</h2>
                    <p className="text-muted-foreground mb-4">Ghi chép này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
                    <Button onClick={() => navigate('/notes')} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách ghi chép
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className=" space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/notes')}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Quay lại</span>
                    </Button>
                    <div className="flex-1 min-w-0">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-xl sm:text-2xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                            placeholder="Tiêu đề ghi chép..."
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleFavorite}
                        className="flex items-center gap-2"
                    >
                        <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        <span className="hidden sm:inline">{isFavorite ? 'Yêu thích' : 'Thêm yêu thích'}</span>
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        <span className="hidden sm:inline">{saving ? 'Đang lưu...' : 'Lưu'}</span>
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <div className="min-h-[600px] border rounded-lg p-4 bg-background">
                <BlockNoteView
                    editor={editor}
                    theme="light"
                    className="w-full"
                />
            </div>

            {/* Metadata */}
            <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <p><span className="font-medium">Tạo:</span> {new Date(note.createdAt).toLocaleString('vi-VN')}</p>
                    <p><span className="font-medium">Cập nhật:</span> {new Date(note.updatedAt).toLocaleString('vi-VN')}</p>
                </div>
                {note.tags && note.tags.length > 0 && (
                    <p><span className="font-medium">Tags:</span> {note.tags.join(', ')}</p>
                )}
                <p><span className="font-medium">Quyền riêng tư:</span> {note.visibility === 'private' ? 'Riêng tư' : 'Công khai'}</p>
            </div>
        </div>
    );
}