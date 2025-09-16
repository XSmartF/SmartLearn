import React from 'react'
import { Lock, Globe } from "lucide-react"
import type { LibraryVisibility } from '@/shared/lib/models'

interface VisibilityBadgeProps {
  visibility: LibraryVisibility
  className?: string
}

export const VisibilityBadge: React.FC<VisibilityBadgeProps> = ({
  visibility,
  className = ''
}) => {
  if (visibility === 'private') {
    return (
      <div className={`flex items-center gap-1 text-xs ${className}`}>
        <Lock className="h-3 w-3 text-orange-500" />
        <span>Chỉ mình tôi</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      <Globe className="h-3 w-3 text-green-500" />
      <span>Mọi người</span>
    </div>
  )
}

interface VisibilitySelectItemProps {
  value: LibraryVisibility
}

export const VisibilitySelectItem: React.FC<VisibilitySelectItemProps> = ({
  value
}) => {
  if (value === 'private') {
    return (
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-orange-500" />
        <span>Chỉ mình tôi</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-green-500" />
      <span>Mọi người</span>
    </div>
  )
}
