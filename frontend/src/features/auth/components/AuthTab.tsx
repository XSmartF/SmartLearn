import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthTabProps {
  onLogin: (data: { email: string; password: string }) => Promise<void>;
  onRegister: (data: { email: string; password: string; displayName?: string }) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function AuthTab({ onLogin, onRegister, onGoogleSignIn, loading, error }: AuthTabProps) {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Đăng nhập</TabsTrigger>
        <TabsTrigger value="register">Đăng ký</TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="mt-6">
        <LoginForm
          onSubmit={onLogin}
          onGoogleSignIn={onGoogleSignIn}
          loading={loading}
          error={error}
        />
      </TabsContent>

      <TabsContent value="register" className="mt-6">
        <RegisterForm
          onSubmit={onRegister}
          loading={loading}
          error={error}
        />
      </TabsContent>
    </Tabs>
  );
}
