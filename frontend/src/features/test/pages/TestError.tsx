import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

export default function TestError() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error('This is a test error to demonstrate ErrorBoundary')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test ErrorBoundary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Click the button below to trigger an error and test the ErrorBoundary component:</p>
          
          <Button 
            variant="destructive"
            onClick={() => setShouldThrow(true)}
          >
            Throw Test Error
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <p>This will demonstrate how errors are handled gracefully in the application.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
