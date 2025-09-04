import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface Props { listView?: boolean }

// Skeleton cấu trúc giống hệt trang LibraryDetail (header, info, flashcard, summary, filter bar, grid/list)
export const LibraryDetailSkeleton: React.FC<Props> = ({ listView }) => {
  return (
    <div className="space-y-6 animate-in fade-in-0">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Real back button (no skeleton) so user can navigate immediately */}
            <Link to="/dashboard/my-library">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="space-y-2">
              <Skeleton className="h-7 w-60" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Library Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FlashCard Section */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="border rounded-md p-10 flex items-center justify-center bg-muted/40">
            <Skeleton className="h-24 w-40" />
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-md space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-2 w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>

        {/* Filter + Actions Bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-md p-3 flex flex-col gap-3 bg-background">
              <div className="flex items-start gap-2">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                  <Skeleton className="h-4 w-10 shimmer" />
                  <Skeleton className="h-4 w-12 shimmer" />
                  <Skeleton className="h-4 w-8 shimmer" />
                </div>
                <div className="flex justify-end gap-2 opacity-70">
                  <Skeleton className="h-7 w-12 shimmer" />
                  <Skeleton className="h-7 w-12 shimmer" />
                </div>
              </div>
            ))}
          </div>
          {!listView && (
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-8 w-48 shimmer" />
              <Skeleton className="h-8 w-56 shimmer" />
            </div>
          )}

          {listView && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/40 h-10 flex items-center px-2 gap-4">
                {Array.from({ length: 9 }).map((_,i)=>(<Skeleton key={i} className="h-4 w-16 shimmer" />))}
              </div>
              <div className="divide-y">
                {Array.from({ length: 8 }).map((_,row)=>(
                  <div key={row} className="h-12 flex items-center px-2 gap-4">
                    {Array.from({ length: 9 }).map((_,col)=>(<Skeleton key={col} className="h-4 w-16 shimmer" />))}
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

export default LibraryDetailSkeleton
