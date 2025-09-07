import React from 'react'
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
        <span className="text-orange-500">🔒</span>
        <span>Chỉ mình tôi</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      <span className="text-green-500">🌐</span>
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
        <span className="text-orange-500">🔒</span>
        <span>Chỉ mình tôi</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-green-500">🌐</span>
      <span>Mọi người</span>
    </div>
  )
}
