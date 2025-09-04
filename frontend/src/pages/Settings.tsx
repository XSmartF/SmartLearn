import { H3 } from '@/components/ui/typography';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 mx-auto h-96 w-full max-w-3xl rounded-xl p-6">
        <H3 className="text-xl font-semibold mb-4">User Preferences</H3>
        <p className="text-muted-foreground">Settings content goes here...</p>
      </div>
    </div>
  )
}
