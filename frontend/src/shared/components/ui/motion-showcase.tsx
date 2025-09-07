import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { MotionWrapper, StaggerWrapper, PageTransition } from "@/shared/components/ui/motion-wrapper"
import { scaleIn } from "@/shared/lib/animations"

// Example component showcasing Framer Motion usage
export const MotionShowcase: React.FC = () => {
  return (
    <PageTransition className="container mx-auto p-6 space-y-8">
      <MotionWrapper>
        <h1 className="text-4xl font-bold text-center mb-8 gradient-text">
          Framer Motion Showcase
        </h1>
      </MotionWrapper>

      <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-motion">
            <CardHeader>
              <CardTitle>Fade In</CardTitle>
              <CardDescription>
                Smooth entrance animation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full">
                Animated Button
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="glass-motion">
            <CardHeader>
              <CardTitle>Hover Effects</CardTitle>
              <CardDescription>
                Interactive hover animations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input placeholder="Animated input field" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="glass-motion">
            <CardHeader>
              <CardTitle>Tap Animation</CardTitle>
              <CardDescription>
                Subtle tap feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" size="sm">
                Tap Me
              </Button>
              <Button variant="outline" size="sm">
                Try This
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </StaggerWrapper>

      <MotionWrapper variant={scaleIn} className="text-center">
        <motion.div
          className="inline-block p-6 rounded-2xl glass-motion"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Interactive Element</h2>
          <p className="text-muted-foreground">
            Subtle hover and tap animations
          </p>
        </motion.div>
      </MotionWrapper>
    </PageTransition>
  )
}

export default MotionShowcase
