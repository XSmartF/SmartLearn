import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'sonner'
import { ArrowLeft, Save, Star, Calendar, Eye, FileText } from "lucide-react"
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/shadcn/style.css";
import { useNote, useNoteFavorites } from '@/shared/hooks/useNotes'
import { noteRepository } from '@/shared/lib/repositories/NoteRepository'
import { Loader } from '@/shared/components/ui/loader'
import { usePersistentTheme } from '@/shared/hooks/usePersistentTheme'
import { PageSection } from '@/shared/components/PageSection'
import { StatCard } from '@/shared/components/StatCard'
import { Badge } from '@/shared/components/ui/badge'

export default function NoteDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { note, loading, error } = useNote(id || '');
    const { favorites, toggleFavorite: toggleFav } = useNoteFavorites();
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const { resolvedTheme } = usePersistentTheme();

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

    // Tính toán tóm tắt nội dung
    const contentSummary = useMemo(() => {
        const blocks = editor.document;
        const totalBlocks = blocks.length;
        const textBlocks = blocks.filter(b => b.type === 'paragraph' || b.type === 'heading');
        const wordCount = blocks.reduce((count, block) => {
            const content = block.content;
            const text = Array.isArray(content) ? content.map((c) => (typeof c === 'object' && c !== null && 'text' in c ? String(c.text) : '')).join(' ') : '';
            return count + text.split(/\s+/).filter(Boolean).length;
        }, 0);
        const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200)); // ~200 từ/phút
        return { totalBlocks, textBlocks: textBlocks.length, wordCount, estimatedReadTime };
    }, [editor.document]);

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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/notes')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent sm:text-3xl"
                            placeholder="Tiêu đề ghi chép..."
                        />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {note.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    )}
                    <Badge variant={note.visibility === 'private' ? 'default' : 'outline'}>
                        {note.visibility === 'private' ? 'Riêng tư' : 'Công khai'}
                    </Badge>
                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFavorite}
                        >
                            <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            size="sm"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<FileText className="h-5 w-5 text-blue-500" />}
                    label="Số khối nội dung"
                    value={contentSummary.totalBlocks}
                    helper={`Bao gồm ${contentSummary.textBlocks} khối văn bản`}
                />
                <StatCard
                    icon={<Eye className="h-5 w-5 text-green-500" />}
                    label="Số từ"
                    value={contentSummary.wordCount}
                    helper="Tổng số từ trong ghi chép"
                />
                <StatCard
                    icon={<Calendar className="h-5 w-5 text-purple-500" />}
                    label="Thời gian đọc"
                    value={`~${contentSummary.estimatedReadTime} phút`}
                    helper="Ước tính thời gian đọc"
                />
                <StatCard
                    icon={<Calendar className="h-5 w-5 text-orange-500" />}
                    label="Cập nhật"
                    value={new Date(note.updatedAt).toLocaleDateString('vi-VN')}
                    helper={new Date(note.updatedAt).toLocaleTimeString('vi-VN')}
                />
            </div>

            {/* Editor */}
            <PageSection
                heading="Nội dung ghi chép"
                description="Soạn thảo và định dạng nội dung ghi chép của bạn."
                contentClassName="min-h-[600px] p-4"
            >
                <BlockNoteView
                    editor={editor}
                    theme={resolvedTheme as "light" | "dark" | undefined}
                    className="w-full"
                />
            </PageSection>
        </div>
    );
}