import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useCreateBlockNote } from '@blocknote/react'

import { parseNoteContent } from '@/features/notes/utils/parseNoteContent'
import { noteRepository } from '@/shared/lib/repositories/NoteRepository'
import { useNote, useNoteFavorites } from '@/shared/hooks/useNotes'

export interface OutlineItem {
  id: string
  level: number
  text: string
}

export interface NoteContentSummary {
  totalBlocks: number
  textBlocks: number
  wordCount: number
  estimatedReadTime: number
}

const UPDATED_AT_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}

export function useNoteDetailView(noteId: string | undefined) {
  const { note, loading, error } = useNote(noteId ?? '')
  const { favorites, toggleFavorite: toggleFavoriteMutation } = useNoteFavorites()

  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const parsedContent = useMemo(() => parseNoteContent(note?.content ?? null), [note?.content])
  const editor = useCreateBlockNote({ initialContent: parsedContent.content })

  const lastLoadedContentRef = useRef<string | null>(null)
  const invalidContentNotifiedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!note) {
      return
    }

    setTitle(note.title)
    setIsFavorite(favorites.includes(note.id))

    const noteContentKey = note.content ?? null
    const hasContentChanged = lastLoadedContentRef.current !== noteContentKey

    if (parsedContent.content && hasContentChanged) {
      try {
        editor.replaceBlocks(editor.document, parsedContent.content)
        lastLoadedContentRef.current = noteContentKey
        invalidContentNotifiedRef.current = null
      } catch (replaceError) {
        console.error('Failed to hydrate BlockNote editor from saved content', replaceError)
        if (invalidContentNotifiedRef.current !== note.id) {
          toast.error('Không thể hiển thị nội dung ghi chép do lỗi định dạng. Hiển thị ghi chú trống.')
          invalidContentNotifiedRef.current = note.id
        }
      }
    } else if (parsedContent.error && hasContentChanged) {
      console.warn('Invalid note content encountered', parsedContent.error)
      if (invalidContentNotifiedRef.current !== note.id) {
        toast.error('Nội dung ghi chép không hợp lệ, hiển thị ghi chú trống.')
        invalidContentNotifiedRef.current = note.id
      }
      lastLoadedContentRef.current = noteContentKey
    }
  }, [note, favorites, editor, parsedContent])

  const outline = useMemo<OutlineItem[]>(() => {
    return editor.document
      .filter((block) => block.type === 'heading')
      .map((block) => {
        const rawText = Array.isArray(block.content)
          ? block.content
              .map((item) => (typeof item === 'object' && item && 'text' in item ? String((item as { text: unknown }).text) : ''))
              .join(' ')
          : ''
        const level = block.props && 'level' in block.props ? Number(block.props.level) : 1

        return {
          id: block.id,
          level,
          text: rawText || 'Untitled',
        }
      })
      .filter((item) => item.text.trim().length > 0)
  }, [editor.document])

  const summary = useMemo<NoteContentSummary>(() => {
    const blocks = editor.document
    const totalBlocks = blocks.length
    const textBlocks = blocks.filter((block) => block.type === 'paragraph' || block.type === 'heading').length
    const wordCount = blocks.reduce((count, block) => {
      const text = Array.isArray(block.content)
        ? block.content
            .map((item) => (typeof item === 'object' && item && 'text' in item ? String((item as { text: unknown }).text) : ''))
            .join(' ')
        : ''

      return count + text.split(/\s+/).filter(Boolean).length
    }, 0)
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200))

    return { totalBlocks, textBlocks, wordCount, estimatedReadTime }
  }, [editor.document])

  const updatedAtLabel = useMemo(() => {
    if (!note) {
      return null
    }

    return new Date(note.updatedAt).toLocaleDateString('vi-VN', UPDATED_AT_FORMAT)
  }, [note])

  const save = useCallback(async () => {
    if (!note) {
      return
    }

    setSaving(true)
    try {
      const content = JSON.stringify(editor.document)
      await noteRepository.updateNote(note.id, { title, content })
      toast.success('Đã lưu ghi chép')
    } catch (saveError) {
      console.error(saveError)
      toast.error('Có lỗi xảy ra khi lưu')
    } finally {
      setSaving(false)
    }
  }, [editor, note, title])

  const toggleFavorite = useCallback(async () => {
    if (!note) {
      return
    }

    try {
      await toggleFavoriteMutation(note.id, isFavorite)
      setIsFavorite((prev) => !prev)
    } catch (toggleError) {
      console.error(toggleError)
      toast.error('Có lỗi xảy ra')
    }
  }, [note, isFavorite, toggleFavoriteMutation])

  if (loading) {
    return {
      status: 'loading',
      note: null,
      error: null,
      title,
      setTitle,
      editor,
      outline: [],
      summary: { totalBlocks: 0, textBlocks: 0, wordCount: 0, estimatedReadTime: 0 },
      updatedAtLabel: null,
      isFavorite,
      toggleFavorite,
      saving,
      save,
    }
  }

  if (error || !note) {
    return {
      status: 'error',
      note: null,
      error: error ?? new Error('Không tìm thấy ghi chép'),
      title,
      setTitle,
      editor,
      outline: [],
      summary: { totalBlocks: 0, textBlocks: 0, wordCount: 0, estimatedReadTime: 0 },
      updatedAtLabel: null,
      isFavorite,
      toggleFavorite,
      saving,
      save,
    }
  }

  return {
    status: 'ready',
    note,
    error: null,
    title,
    setTitle,
    editor,
    outline,
    summary,
    updatedAtLabel,
    isFavorite,
    toggleFavorite,
    saving,
    save,
  }
}

export type UseNoteDetailViewResult = ReturnType<typeof useNoteDetailView>
