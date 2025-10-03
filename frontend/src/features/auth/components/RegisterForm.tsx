import { Fragment } from "react";
import { Button } from "@/shared/components/ui/button";
import { ErrorDisplay } from "@/shared/components/ui/error-display";
import { EmailIcon, LockIcon, ShieldCheckIcon, SuccessIcon, UserIcon } from "@/shared/components/ui/icons";
import { Input } from "@/shared/components/ui/input";
import { Loader } from "@/shared/components/ui/loader";
import { Progress } from "@/shared/components/ui/progress";
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="grid gap-5">
        {[
          {
            id: "displayName",
            label: "Tên hiển thị",
            placeholder: "VD: Minh Anh",
            icon: UserIcon,
            helper: "Tên sẽ xuất hiện trong bảng xếp hạng và lớp học của bạn."
          },
          {
            id: "email",
            label: "Email",
            placeholder: "nhatlinh@smartlearn.vn",
            type: "email",
            icon: EmailIcon,
            helper: "Chúng tôi sẽ gửi email xác nhận tài khoản trong 2 phút."
          },
          {
            id: "password",
            label: "Mật khẩu",
            placeholder: "Tạo mật khẩu bảo mật",
            type: "password",
            icon: LockIcon,
            helper: "Nên dùng ít nhất 1 ký tự viết hoa, 1 số và 1 ký tự đặc biệt."
          }
        ].map((field) => {
          const Icon = field.icon;
          const value = values[field.id as keyof RegisterCredentials];
          return (
            <Fragment key={field.id}>
              <label htmlFor={field.id} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Icon className="h-4 w-4" />
                </span>
                {field.label}
              </label>
              <div className="relative">
                <Input
                  id={field.id}
                  type={field.type ?? "text"}
                  value={value as string}
                  onChange={(event) => onFieldChange(field.id as keyof RegisterCredentials, event.target.value)}
                  required={field.id !== "displayName"}
                  placeholder={field.placeholder}
                  className="peer pl-12 pr-4 py-3 text-[15px] font-medium shadow-[0_12px_30px_-18px_rgba(16,185,129,0.45)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                />
                <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 peer-focus-visible:text-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground/80">{field.helper}</p>
            </Fragment>
          );
        })}
      </fieldset>

      <div className="grid gap-4 rounded-3xl border border-emerald-200/60 bg-emerald-50/70 p-5 text-sm text-emerald-900 shadow-[0_25px_60px_-45px_rgba(16,185,129,0.75)]">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="mt-0.5 h-5 w-5" />
          <div className="space-y-1">
            <p className="font-semibold">Quyền lợi tài khoản SmartLearn</p>
            <ul className="grid gap-1 text-xs">
              <li>• Lộ trình học cá nhân hóa theo mục tiêu</li>
              <li>• Ôn luyện hàng ngày với AI Mentor</li>
              <li>• Chia sẻ tiến độ và hợp tác với bạn học</li>
            </ul>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold">
            <span>Chuẩn bị hoàn tất hồ sơ</span>
            <span>55%</span>
          </div>
          <Progress value={55} className="h-2 overflow-hidden rounded-full bg-emerald-100">
            {/* indicator inside */}
          </Progress>
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
            <SuccessIcon className="h-4 w-4" />
            <span>Hoàn tất đăng ký</span>
          </div>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground/80">
        Đã có tài khoản? <span className="font-semibold text-primary underline-offset-4 hover:underline">Đăng nhập ngay</span>
      </p>
    </form>
  );
}
