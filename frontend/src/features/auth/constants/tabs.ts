import { LogIn, UserPlus } from "lucide-react";
import type { AuthTabConfig } from "@/features/auth/types";

export const AUTH_TABS: AuthTabConfig[] = [
  {
    id: "login",
    label: "Đăng nhập",
    description: "Quay lại hành trình học tập của bạn",
    icon: LogIn
  },
  {
    id: "register",
    label: "Đăng ký",
    description: "Bắt đầu tạo tài khoản SmartLearn mới",
    icon: UserPlus
  }
];
