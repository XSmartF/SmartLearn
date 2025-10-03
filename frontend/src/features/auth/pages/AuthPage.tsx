import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { AuthHero, AuthTabs, LoginForm, RegisterForm } from "@/features/auth/components";
import { useAuthView } from "@/features/auth/hooks/useAuthView";

export default function AuthPage() {
  const view = useAuthView();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AuthHero model={view.hero} />

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <Card className="shadow-2xl border-0 bg-white/85 backdrop-blur-md">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-foreground">{view.card.header.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {view.card.header.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
