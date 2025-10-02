import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuthRedux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { SmartImage } from '@/shared/components/ui/smart-image';
import { H1, Lead, P } from '@/shared/components/ui/typography';
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
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Left side - Background with branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-white max-w-md mx-auto text-center">
          <div className="mb-8">
            <SmartImage
              src="/smartlearn.svg"
              alt="SmartLearn"
              className="w-16 h-16 mx-auto mb-4 animate-pulse"
              imageClassName="object-contain"
              loading="lazy"
            />
            <H1 className="text-4xl font-bold mb-4 animate-fade-in">SmartLearn</H1>
            <Lead className="opacity-90 animate-fade-in-delay">
              Nền tảng học tập thông minh của bạn
            </Lead>
          </div>
          <div className="relative">
            <P className="text-lg opacity-90 mb-4 animate-fade-in-delay">
              Học tập thông minh, tương lai tươi sáng
            </P>
            <div className="typing-container">
              <span className="typing-text">
                Khám phá kiến thức mới mỗi ngày...
              </span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-float-delay"></div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-800">Chào mừng</CardTitle>
              <CardDescription className="text-gray-600">
                Đăng nhập hoặc tạo tài khoản mới
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
      </div>
    </div>
  );
}
