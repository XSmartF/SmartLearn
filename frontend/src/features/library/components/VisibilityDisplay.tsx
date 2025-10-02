import React from 'react'
import { Lock, Globe } from "lucide-react"
import type { LibraryVisibility } from '@/shared/lib/models'

interface VisibilityBadgeProps {
  visibility: LibraryVisibility
  className?: string
  showLabel?: boolean
}

export const VisibilityBadge: React.FC<VisibilityBadgeProps> = ({
  visibility,
  className = '',
  showLabel = true
}) => {
  const isPrivate = visibility === 'private'
  const label = isPrivate ? 'Chỉ mình tôi' : 'Mọi người'
  const baseClass = `inline-flex items-center gap-1 text-xs ${className}`.trim()

  return (
    <span
      className={baseClass}
      title={showLabel ? undefined : label}
      aria-label={showLabel ? undefined : label}
    >
      {isPrivate ? (
        <Lock className="h-3 w-3 text-orange-500" />
      ) : (
        <Globe className="h-3 w-3 text-green-500" />
      )}
      {showLabel ? (
        <span>{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
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
