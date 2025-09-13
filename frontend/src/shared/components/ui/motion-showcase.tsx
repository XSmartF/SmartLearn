import React from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"

// Example component showcasing static UI
export const MotionShowcase: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-center mb-8 gradient-text">
          UI Showcase
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
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
        </div>

        <div>
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
        </div>

        <div>
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
        </div>
      </div>

      <div className="text-center">
        <div className="inline-block p-6 rounded-2xl glass-motion">
          <h2 className="text-2xl font-semibold mb-4">Interactive Element</h2>
          <p className="text-muted-foreground">
            Subtle hover and tap animations
          </p>
        </div>
      </div>
    </div>
  )
}

export default MotionShowcase
