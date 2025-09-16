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
      <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg h-12">
        <TabsTrigger
          value="login"
          className="rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Đăng nhập
        </TabsTrigger>
        <TabsTrigger
          value="register"
          className="rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Đăng ký
        </TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="mt-8">
        <LoginForm
          onSubmit={onLogin}
          onGoogleSignIn={onGoogleSignIn}
          loading={loading}
          error={error}
        />
      </TabsContent>

      <TabsContent value="register" className="mt-8">
        <RegisterForm
          onSubmit={onRegister}
          loading={loading}
          error={error}
        />
      </TabsContent>
    </Tabs>
  );
}
