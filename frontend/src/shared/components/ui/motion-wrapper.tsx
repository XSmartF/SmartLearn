import React from "react"
import { cn } from "@/shared/lib/utils"

interface MotionWrapperProps {
  children: React.ReactNode
  className?: string
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

interface StaggerWrapperProps {
  children: React.ReactNode
  className?: string
}

export const StaggerWrapper: React.FC<StaggerWrapperProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("", className)}>
      {React.Children.map(children, (child, index) => (
        <div key={index}>
          {child}
        </div>
      ))}
    </div>
  )
}

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}
