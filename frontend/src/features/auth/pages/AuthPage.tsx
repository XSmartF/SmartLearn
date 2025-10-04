import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { AuthHero, AuthTabs, LoginForm, RegisterForm } from "@/features/auth/components";
import { useAuthView } from "@/features/auth/hooks/useAuthView";

export default function AuthPage() {
  const view = useAuthView();

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 via-white to-purple-200/55" />
        <AuthHero model={view.hero} variant="background" className="absolute inset-0" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl animate-fade-in-up">
          <Card className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/90 shadow-[0_30px_90px_-35px_rgba(30,64,175,0.45)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -top-20 right-14 hidden h-36 w-36 rounded-full bg-primary/20 blur-3xl lg:block" />
            <div className="pointer-events-none absolute -bottom-24 left-10 hidden h-40 w-40 rounded-full bg-sky-300/25 blur-3xl lg:block" />
            <CardHeader className="relative z-10 space-y-2 px-8 pt-10 pb-4 text-center">
              <CardTitle className="text-3xl font-semibold text-foreground tracking-tight">
                {view.card.header.title}
              </CardTitle>
              <CardDescription className="mx-auto max-w-2xl text-base text-muted-foreground/90">
                {view.card.header.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 px-8 pb-10 pt-4">
              <AuthTabs
                tabs={view.tabs}
                activeTab={view.activeTab}
                onTabChange={view.setActiveTab}
                content={{
                  login: (
                    <LoginForm
                      values={view.loginForm.values}
                      onFieldChange={view.loginForm.onFieldChange}
                      onSubmit={view.loginForm.onSubmit}
                      onGoogleSignIn={view.loginForm.onGoogleSignIn}
                      isSubmitting={view.loginForm.isSubmitting}
                      error={view.loginForm.error}
                    />
                  ),
                  register: (
                    <RegisterForm
                      values={view.registerForm.values}
                      onFieldChange={view.registerForm.onFieldChange}
                      onSubmit={view.registerForm.onSubmit}
                      isSubmitting={view.registerForm.isSubmitting}
                      error={view.registerForm.error}
                    />
                  )
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
