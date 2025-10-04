import { Button } from "@/shared/components/ui/button";
import { ErrorDisplay } from "@/shared/components/ui/error-display";
import { EmailIcon, LockIcon } from "@/shared/components/ui/icons";
import { Input } from "@/shared/components/ui/input";
import { Loader } from "@/shared/components/ui/loader";
import { Switch } from "@/shared/components/ui/switch";
import type { LoginCredentials } from "@/features/auth/types";

interface LoginFormProps {
  values: LoginCredentials;
  onFieldChange: (field: keyof LoginCredentials, value: string) => void;
  onSubmit: () => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export default function LoginForm({
  values,
  onFieldChange,
  onSubmit,
  onGoogleSignIn,
  isSubmitting,
  error
}: LoginFormProps) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="grid gap-4">
        {[
          {
            id: "email",
            label: "Email",
            placeholder: "vietanh@smartlearn.vn",
            type: "email",
            icon: EmailIcon
          },
          {
            id: "password",
            label: "Mật khẩu",
            placeholder: "Nhập mật khẩu",
            type: "password",
            icon: LockIcon
          }
        ].map((field) => {
          const Icon = field.icon;
          const value = values[field.id as keyof LoginCredentials];

          return (
            <label key={field.id} htmlFor={field.id} className="space-y-2 text-left">
              <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {field.label}
              </span>
              <div className="relative">
                <Input
                  id={field.id}
                  type={field.type}
                  value={value as string}
                  onChange={(event) => onFieldChange(field.id as keyof LoginCredentials, event.target.value)}
                  required
                  placeholder={field.placeholder}
                  className="peer py-3 pl-11 pr-4 text-[15px] font-medium shadow-[0_12px_30px_-20px_rgba(37,99,235,0.55)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60"
                />
                <Icon
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 peer-focus-visible:text-primary"
                  aria-hidden="true"
                />
              </div>
            </label>
          );
        })}
      </fieldset>

      <div className="flex items-center justify-between text-xs text-muted-foreground/80">
        <Switch
          disabled={isSubmitting}
          label="Ghi nhớ đăng nhập"
          className="gap-3 text-xs font-medium text-muted-foreground/80"
        />
        <a href="#" className="font-semibold text-primary underline-offset-4 hover:underline">
          Quên mật khẩu?
        </a>
      </div>

      <ErrorDisplay error={error} />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-primary via-violet-600 to-sky-500 text-base font-semibold shadow-[0_18px_35px_-18px_rgba(56,189,248,0.75)] transition-transform duration-200 hover:translate-y-[-1px]"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-3">
            <Loader size="sm" />
            <span>Đang xử lý...</span>
          </div>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Đăng nhập ngay</span>
          </span>
        )}
      </Button>

      <div className="relative flex items-center justify-center py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
        <span className="absolute inset-x-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="relative bg-white px-3">Hoặc đăng nhập nhanh</span>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onGoogleSignIn}
        disabled={isSubmitting}
        className="flex h-11 items-center justify-center gap-3 rounded-2xl border border-border bg-white/90 text-sm font-semibold shadow-[0_18px_35px_-20px_rgba(15,23,42,0.4)] backdrop-blur"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
        <span>Đăng nhập với Google</span>
      </Button>

      <p className="text-center text-[11px] text-muted-foreground/80">
        Bằng việc tiếp tục, bạn đồng ý với <a href="#" className="font-semibold text-primary underline-offset-4 hover:underline">Điều khoản</a> &
        <a href="#" className="font-semibold text-primary underline-offset-4 hover:underline"> Chính sách bảo mật</a> của SmartLearn.
      </p>
    </form>
  );
}
