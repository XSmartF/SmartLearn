import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface AuthFormProps {
  title: string;
  onSubmit: (data: { email: string; password: string; displayName?: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
  showDisplayName?: boolean;
  submitText: string;
  linkText?: string;
  linkTo?: string;
  showLink?: boolean;
}

export default function AuthForm({
  title,
  onSubmit,
  loading,
  error,
  showDisplayName = false,
  submitText,
  linkText,
  linkTo,
  showLink = true
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email, password, displayName: showDisplayName ? displayName : undefined });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {showDisplayName && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên hiển thị</label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Đang xử lý...' : submitText}
            </Button>
            {showLink && linkText && linkTo && (
              <p className="text-xs text-center text-muted-foreground">
                <Link to={linkTo} className="underline">{linkText}</Link>
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
