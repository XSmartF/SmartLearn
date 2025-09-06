import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { StudyEvent, CreateStudyEventInput } from '../types/calendar';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CreateStudyEventInput) => Promise<void>;
  editingEvent?: StudyEvent | null;
  viewOnly?: boolean;
}

export function EventDialog({ isOpen, onClose, onSave, editingEvent, viewOnly = false }: EventDialogProps) {
  const [formData, setFormData] = useState<CreateStudyEventInput>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    type: 'study',
    flashcardSet: '',
    cardCount: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description,
        startTime: editingEvent.startTime,
        endTime: editingEvent.endTime,
        type: editingEvent.type,
        flashcardSet: editingEvent.flashcardSet,
        cardCount: editingEvent.cardCount
      });
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        type: 'study',
        flashcardSet: '',
        cardCount: 0
      });
    }
  }, [editingEvent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateStudyEventInput, value: string | number | Date | StudyEvent['type']) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
          </DialogTitle>
          <DialogDescription>
            {editingEvent
              ? 'Cập nhật thông tin sự kiện học tập'
              : 'Tạo sự kiện mới cho lịch học tập của bạn'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            {viewOnly ? (
              <div className="p-2 bg-muted rounded">{formData.title}</div>
            ) : (
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ví dụ: Ôn tập từ vựng TOEIC"
                required
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            {viewOnly ? (
              <div className="p-2 bg-muted rounded min-h-[80px]">{formData.description}</div>
            ) : (
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về sự kiện..."
                rows={3}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Thời gian bắt đầu</Label>
              {viewOnly ? (
                <div className="p-2 bg-muted rounded">
                  {formData.startTime.toLocaleString('vi-VN')}
                </div>
              ) : (
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime.toISOString().slice(0, 16)}
                  onChange={(e) => handleInputChange('startTime', new Date(e.target.value))}
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Thời gian kết thúc</Label>
              {viewOnly ? (
                <div className="p-2 bg-muted rounded">
                  {formData.endTime.toLocaleString('vi-VN')}
                </div>
              ) : (
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime.toISOString().slice(0, 16)}
                  onChange={(e) => handleInputChange('endTime', new Date(e.target.value))}
                  required
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loại sự kiện</Label>
            {viewOnly ? (
              <div className="p-2 bg-muted rounded">
                {formData.type === 'review' && 'Ôn tập'}
                {formData.type === 'study' && 'Học mới'}
                {formData.type === 'deadline' && 'Deadline'}
                {formData.type === 'challenge' && 'Thử thách'}
                {formData.type === 'favorite_review' && 'Yêu thích'}
                {formData.type === 'create' && 'Tạo mới'}
              </div>
            ) : (
              <Select
                value={formData.type}
                onValueChange={(value: StudyEvent['type']) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="review">Ôn tập</SelectItem>
                  <SelectItem value="study">Học mới</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="challenge">Thử thách</SelectItem>
                  <SelectItem value="favorite_review">Yêu thích</SelectItem>
                  <SelectItem value="create">Tạo mới</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="flashcardSet">Bộ thẻ</Label>
            {viewOnly ? (
              <div className="p-2 bg-muted rounded">{formData.flashcardSet}</div>
            ) : (
              <Input
                id="flashcardSet"
                value={formData.flashcardSet}
                onChange={(e) => handleInputChange('flashcardSet', e.target.value)}
                placeholder="Ví dụ: Từ vựng TOEIC"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardCount">Số lượng thẻ</Label>
            {viewOnly ? (
              <div className="p-2 bg-muted rounded">{formData.cardCount}</div>
            ) : (
              <Input
                id="cardCount"
                type="number"
                min="0"
                value={formData.cardCount}
                onChange={(e) => handleInputChange('cardCount', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {viewOnly ? 'Đóng' : 'Hủy'}
            </Button>
            {!viewOnly && (
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang lưu...' : (editingEvent ? 'Cập nhật' : 'Thêm')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
