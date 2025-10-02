import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Loader } from '@/shared/components/ui/loader';
import { ErrorDisplay } from '@/shared/components/ui/error-display';
import { EmailIcon, LockIcon } from '@/shared/components/ui/icons';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function LoginForm({ onSubmit, onGoogleSignIn, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <EmailIcon className="mr-2 text-blue-500" />
          Email
        </label>
        <div className="relative">
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <LockIcon className="mr-2 text-blue-500" />
          Mật khẩu
        </label>
        <div className="relative">
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <ErrorDisplay error={error} />
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="mr-3 scale-50">
              <Loader size="sm" />
            </div>
            Đang xử lý...
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Đăng nhập
          </div>
        )}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-500 font-medium">Hoặc</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onGoogleSignIn}
        disabled={loading}
        className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-sm"
      >
        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="font-medium">Đăng nhập với Google</span>
      </Button>
    </form>
  );
}
