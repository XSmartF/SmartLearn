import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Tên hiển thị</label>
        <Input
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Tên của bạn"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mật khẩu</label>
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Đang xử lý...' : 'Đăng ký'}
      </Button>
    </form>
  );
}
