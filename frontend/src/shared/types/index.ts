export interface Flashcard {
    id: string
    front: string
    back: string,
    description: string,
    createdAt: number
    updatedAt: number
    libraryId: string
}

export interface FlashcardSet {
    id: string
    title: string
    createdAt: number
    updatedAt: number
    userId: string
    flashcards: Flashcard[]
}

export interface User {
    id: string
    email: string
    avatar: string | null
    displayName: string
    createdAt: number
    updatedAt: number,
}


export * from './pagination'
