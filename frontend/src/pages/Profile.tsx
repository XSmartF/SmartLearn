export default function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your profile information.
        </p>
      </div>
      <div className="bg-muted/50 mx-auto h-96 w-full max-w-3xl rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <p className="text-muted-foreground">Profile content goes here...</p>
      </div>
    </div>
  )
}
