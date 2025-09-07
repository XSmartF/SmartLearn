import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuthRedux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import AuthTab from '../components/AuthTab';
import { ROUTES } from '@/shared/constants/routes';

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      nav(ROUTES.HOME);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: { email: string; password: string; displayName?: string }) => {
    setError(null);
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.displayName);
      nav(ROUTES.HOME);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      nav(ROUTES.HOME);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google đăng nhập thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl font-bold">SmartLearn</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Nền tảng học tập thông minh của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthTab
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGoogleSignIn={handleGoogleSignIn}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}
