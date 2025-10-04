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
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-6 sm:px-6 lg:px-12 lg:py-8 md:justify-center">
        <div className="w-full max-w-md lg:max-w-lg animate-fade-in-up">
          <Card className="relative max-h-[92vh] overflow-hidden rounded-[24px] border border-white/40 bg-white/85 shadow-[0_25px_75px_-35px_rgba(17,24,39,0.5)]">
            <div className="pointer-events-none absolute -top-16 right-10 hidden h-28 w-28 rounded-full bg-primary/25 blur-3xl lg:block" />
            <div className="pointer-events-none absolute -bottom-20 left-6 hidden h-32 w-32 rounded-full bg-sky-300/30 blur-3xl lg:block" />
            <CardHeader className="relative z-10 space-y-2 px-6 pt-6 pb-3 text-center">
              <CardTitle className="text-2xl font-semibold text-foreground tracking-tight">
                {view.card.header.title}
              </CardTitle>
              <CardDescription className="mx-auto max-w-lg text-sm text-muted-foreground/90">
                {view.card.header.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 px-6 pb-6 pt-3">
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
