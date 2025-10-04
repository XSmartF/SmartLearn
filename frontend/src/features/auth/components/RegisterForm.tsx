import { Button } from "@/shared/components/ui/button";
import { ErrorDisplay } from "@/shared/components/ui/error-display";
import { EmailIcon, LockIcon, ShieldCheckIcon, SuccessIcon, UserIcon } from "@/shared/components/ui/icons";
import { Input } from "@/shared/components/ui/input";
import { Loader } from "@/shared/components/ui/loader";
import type { RegisterCredentials } from "@/features/auth/types";

interface RegisterFormProps {
  values: RegisterCredentials;
  onFieldChange: (field: keyof RegisterCredentials, value: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export default function RegisterForm({ values, onFieldChange, onSubmit, isSubmitting, error }: RegisterFormProps) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="grid gap-4">
        {[
          {
            id: "displayName",
            label: "Tên hiển thị",
            placeholder: "VD: Minh Anh",
            icon: UserIcon,
            required: false
          },
          {
            id: "email",
            label: "Email",
            placeholder: "nhatlinh@smartlearn.vn",
            type: "email",
            icon: EmailIcon,
            required: true
          },
          {
            id: "password",
            label: "Mật khẩu",
            placeholder: "Tạo mật khẩu",
            type: "password",
            icon: LockIcon,
            required: true
          }
        ].map((field) => {
          const Icon = field.icon;
          const value = values[field.id as keyof RegisterCredentials];
          return (
            <label key={field.id} htmlFor={field.id} className="space-y-2 text-left">
              <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {field.label}
              </span>
              <div className="relative">
                <Input
                  id={field.id}
                  type={field.type ?? "text"}
                  value={value as string}
                  onChange={(event) => onFieldChange(field.id as keyof RegisterCredentials, event.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="peer py-3 pl-11 pr-4 text-[15px] font-medium shadow-[0_12px_30px_-20px_rgba(16,185,129,0.55)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                />
                <Icon
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 peer-focus-visible:text-emerald-500"
                  aria-hidden="true"
                />
              </div>
            </label>
          );
        })}
      </fieldset>

      <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-4 text-xs text-emerald-900">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Quyền lợi tài khoản SmartLearn</p>
            <p>AI Mentor đồng hành và lộ trình học cá nhân hóa giúp bạn duy trì nhịp độ.</p>
          </div>
        </div>
      </div>

      <ErrorDisplay error={error} />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 text-base font-semibold text-white shadow-[0_22px_40px_-20px_rgba(16,185,129,0.8)] transition-transform duration-200 hover:translate-y-[-1px]"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-3">
            <Loader size="sm" />
            <span>Đang tạo tài khoản...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <SuccessIcon className="h-4 w-4" aria-hidden="true" />
            <span>Hoàn tất đăng ký</span>
          </div>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground/80">
        Đã có tài khoản? <a href="#" className="font-semibold text-primary underline-offset-4 hover:underline">Đăng nhập ngay</a>
      </p>
    </form>
  );
}
