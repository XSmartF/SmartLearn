import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'sonner'
import { ArrowLeft, Save, Star, Calendar, Eye, FileText, List } from "lucide-react"
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/shadcn/style.css";
import "./NoteDetail.css";
import { useNote, useNoteFavorites } from '@/shared/hooks/useNotes'
import { noteRepository } from '@/shared/lib/repositories/NoteRepository'
import { Loader } from '@/shared/components/ui/loader'
import { usePersistentTheme } from '@/shared/hooks/usePersistentTheme'
import { Badge } from '@/shared/components/ui/badge'
import { 
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/popover'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'
import { parseNoteContent } from '@/features/notes/utils/parseNoteContent'

export default function NoteDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { note, loading, error } = useNote(id || '');
    const { favorites, toggleFavorite: toggleFav } = useNoteFavorites();
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showOutline, setShowOutline] = useState(true);
    const { resolvedTheme } = usePersistentTheme();
    const lastLoadedContentRef = useRef<string | null>(null);
    const invalidContentNotifiedRef = useRef<string | null>(null);

    const parsedContent = useMemo(() => parseNoteContent(note?.content ?? null), [note?.content]);

    const editor = useCreateBlockNote({
        initialContent: parsedContent.content,
    });

    useEffect(() => {
        if (!note) {
            return;
        }

        setTitle(note.title);
        setIsFavorite(favorites.includes(note.id));

        const noteContentKey = note.content ?? null;
        const hasContentChanged = lastLoadedContentRef.current !== noteContentKey;

        if (parsedContent.content && hasContentChanged) {
            try {
                editor.replaceBlocks(editor.document, parsedContent.content);
                lastLoadedContentRef.current = noteContentKey;
                invalidContentNotifiedRef.current = null;
            } catch (replaceError) {
                console.error('Failed to hydrate BlockNote editor from saved content', replaceError);
                if (invalidContentNotifiedRef.current !== note.id) {
                    toast.error('Không thể hiển thị nội dung ghi chép do lỗi định dạng. Hiển thị ghi chú trống.');
                    invalidContentNotifiedRef.current = note.id;
                }
            }
        } else if (parsedContent.error && hasContentChanged) {
            console.warn('Invalid note content encountered', parsedContent.error);
            if (invalidContentNotifiedRef.current !== note.id) {
                toast.error('Nội dung ghi chép không hợp lệ, hiển thị ghi chú trống.');
                invalidContentNotifiedRef.current = note.id;
            }
            lastLoadedContentRef.current = noteContentKey;
        }
    }, [note, editor, favorites, parsedContent]);

    // Tính toán outline từ headings
    interface OutlineItem {
        id: string;
        level: number;
        text: string;
    }

    const outline = useMemo<OutlineItem[]>(() => {
        const blocks = editor.document;
        return blocks
            .filter(b => b.type === 'heading')
            .map(block => {
                const content = block.content;
                const text = Array.isArray(content) 
                    ? content.map((c) => (typeof c === 'object' && c !== null && 'text' in c ? String(c.text) : '')).join(' ')
                    : '';
                const level = (block.props && 'level' in block.props) ? Number(block.props.level) : 1;
                return {
                    id: block.id,
                    level,
                    text: text || 'Untitled'
                };
            })
            .filter(item => item.text.trim().length > 0);
    }, [editor.document]);

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

    const scrollToBlock = (blockId: string) => {
        const blockElement = document.querySelector(`[data-id="${blockId}"]`);
        if (blockElement) {
            blockElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

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
        <div className="flex flex-col h-full">
            {/* Header with inline title input */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="container max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/notes')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="flex-1 text-xl font-semibold border-0 shadow-none px-2 h-10 focus-visible:ring-1 focus-visible:ring-ring bg-transparent"
                            placeholder="Tiêu đề ghi chép..."
                        />
                        <div className="flex items-center gap-2">
                            {/* Toggle Outline Button */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9"
                                onClick={() => setShowOutline(!showOutline)}
                            >
                                <List className="h-4 w-4 mr-2" />
                                {showOutline ? 'Ẩn' : 'Hiện'} Outline
                            </Button>
                            
                            {/* Summary Popover */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-9">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Thông tin
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72" align="end">
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm">Tóm tắt ghi chép</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Số khối
                                                </span>
                                                <span className="font-medium">{contentSummary.totalBlocks} khối</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Số từ
                                                </span>
                                                <span className="font-medium">{contentSummary.wordCount} từ</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Thời gian đọc
                                                </span>
                                                <span className="font-medium">~{contentSummary.estimatedReadTime} phút</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Cập nhật
                                                </span>
                                                <span className="font-medium text-xs">
                                                    {new Date(note.updatedAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFavorite}
                                className="h-9 w-9"
                            >
                                <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                size="sm"
                                className="h-9"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Tags and visibility in a compact row */}
                    {(note.tags && note.tags.length > 0) || note.visibility && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 ml-12">
                            {note.tags && note.tags.length > 0 && note.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            <div
                                className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-full border",
                                    note.visibility === 'private'
                                        ? 'bg-orange-100 border-orange-200 text-orange-500'
                                        : 'bg-green-100 border-green-200 text-green-600'
                                )}
                                aria-label={note.visibility === 'private' ? 'Ghi chép riêng tư' : 'Ghi chép công khai'}
                                title={note.visibility === 'private' ? 'Riêng tư' : 'Công khai'}
                            >
                                <Eye className="h-3 w-3" aria-hidden="true" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main content with outline sidebar */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Editor - Main scrollable area, always full width */}
                <div className="flex-1 overflow-auto">
                    <div className="px-6 py-6">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                            <div className="p-8 min-h-[calc(100vh-12rem)]">
                                <BlockNoteView
                                    editor={editor}
                                    theme={resolvedTheme as "light" | "dark" | undefined}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Outline Sidebar - Fixed overlay on right side */}
                {showOutline && outline.length > 0 && (
                    <div className="hidden xl:block fixed right-0 w-72 pointer-events-none z-20" style={{ top: '7rem', height: 'calc(100vh - 7rem)' }}>
                        <div className="h-full flex flex-col p-4 pr-6 pointer-events-auto">
                            <div className="rounded-lg border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 shadow-lg flex-1 flex flex-col max-h-full">
                                <div className="p-4 border-b flex-shrink-0">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                        <List className="h-3.5 w-3.5" />
                                        Mục lục
                                    </h3>
                                </div>
                                <ScrollArea className="flex-1 min-h-0">
                                    <div className="p-4 space-y-1">
                                        {outline.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => scrollToBlock(item.id)}
                                                className={cn(
                                                    "w-full text-left text-sm py-1.5 px-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                                                    "line-clamp-2"
                                                )}
                                                style={{ 
                                                    paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                                                    fontSize: item.level === 1 ? '0.8125rem' : '0.75rem',
                                                    fontWeight: item.level === 1 ? 600 : 400
                                                }}
                                            >
                                                {item.text}
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}