import React from "react"
import { motion, type Variants, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/shared/lib/utils"

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  variant?: Variants
  className?: string
  delay?: number
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  variant,
  className,
  delay = 0,
  ...props
}) => {
  const defaultVariants: Variants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        delay,
      },
    },
  }

  return (
    <motion.div
      className={cn("", className)}
      variants={variant || defaultVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StaggerWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export const StaggerWrapper: React.FC<StaggerWrapperProps> = ({
  children,
  className,
  staggerDelay = 0.05,
  ...props
}) => {
  return (
    <motion.div
      className={cn("", className)}
      initial="initial"
      animate="animate"
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

interface PageTransitionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  ...props
}) => {
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <motion.div
      className={cn("", className)}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  )
}
