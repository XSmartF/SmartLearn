import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Loader } from '@/shared/components/ui/loader';
import { ErrorDisplay } from '@/shared/components/ui/error-display';
import { EmailIcon, LockIcon, UserIcon, SuccessIcon } from '@/shared/components/ui/icons';

interface RegisterFormProps {
  onSubmit: (data: { email: string; password: string; displayName?: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function RegisterForm({ onSubmit, loading, error }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email, password, displayName });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <UserIcon className="mr-2 text-blue-500" />
          Tên hiển thị
        </label>
        <div className="relative">
          <Input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Tên của bạn"
            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
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
          <EmailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
          <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <ErrorDisplay error={error} />
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
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
            <SuccessIcon className="mr-2" />
            Đăng ký
          </div>
        )}
      </Button>
    </form>
  );
}
