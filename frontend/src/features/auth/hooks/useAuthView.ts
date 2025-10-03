import { useCallback, useMemo, useState } from "react";
import { Brain, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { AUTH_TABS } from "@/features/auth/constants/tabs";
import { useAuthFlow } from "@/features/auth/hooks/useAuthFlow";
import { useAuthForms } from "@/features/auth/hooks/useAuthForms";
import type {
  AuthCardHeaderModel,
  AuthHeroModel,
  AuthTabConfig,
  AuthTabId,
  LoginCredentials,
  RegisterCredentials
} from "@/features/auth/types";

interface AuthViewModel {
  hero: AuthHeroModel;
  card: {
    header: AuthCardHeaderModel;
  };
  tabs: AuthTabConfig[];
  activeTab: AuthTabId;
  setActiveTab: (tab: AuthTabId) => void;
  loginForm: {
    values: LoginCredentials;
    onFieldChange: (field: keyof LoginCredentials, value: string) => void;
    onSubmit: () => Promise<void>;
    onGoogleSignIn: () => Promise<void>;
    isSubmitting: boolean;
    error: string | null;
  };
  registerForm: {
    values: RegisterCredentials;
    onFieldChange: (field: keyof RegisterCredentials, value: string) => void;
    onSubmit: () => Promise<void>;
    isSubmitting: boolean;
    error: string | null;
  };
}

export function useAuthView(): AuthViewModel {
  const [activeTab, setActiveTabState] = useState<AuthTabId>("login");

  const forms = useAuthForms();
  const flow = useAuthFlow();
  const { login: loginAction, register: registerAction, googleSignIn: googleSignInAction, resetError } = flow.actions;

  const setActiveTab = useCallback(
    (tab: AuthTabId) => {
      resetError();
      setActiveTabState(tab);
    },
    [resetError]
  );

  const handleLoginChange = useCallback(
    (field: keyof LoginCredentials, value: string) => {
      resetError();
      forms.updateLoginField(field, value);
    },
    [forms, resetError]
  );

  const handleRegisterChange = useCallback(
    (field: keyof RegisterCredentials, value: string) => {
      resetError();
      forms.updateRegisterField(field, value);
    },
    [forms, resetError]
  );

  const submitLogin = useCallback(async () => {
    await loginAction(forms.login);
  }, [forms.login, loginAction]);

  const submitRegister = useCallback(async () => {
    await registerAction(forms.register);
  }, [forms.register, registerAction]);

  const submitGoogle = useCallback(async () => {
    await googleSignInAction();
  }, [googleSignInAction]);

  const hero: AuthHeroModel = useMemo(
    () => ({
      brand: {
        name: "SmartLearn",
        logoSrc: "/smartlearn.svg",
        logoAlt: "Logo SmartLearn",
        tagline: "Personalized learning for every goal"
      },
      eyebrow: "NỀN TẢNG THÔNG MINH",
      headline: "Vững kiến thức, chạm đích nhanh hơn",
      subheadline: "Lộ trình học tập được tùy chỉnh theo hành vi và mục tiêu của bạn, luôn đồng hành với nhắc nhở chính xác theo nhịp tiến độ.",
      description:
        "SmartLearn sử dụng AI để nắm bắt điểm mạnh, điểm yếu và thói quen học tập của bạn. Chúng tôi sắp xếp nội dung, đề xuất bài luyện tập và gửi nhắc nhở đúng thời điểm để bạn không bỏ lỡ bất kỳ cột mốc nào.",
      features: [
        {
          title: "Theo dõi tiến độ realtime",
          description: "Biết chính xác bạn đã hoàn thành bao nhiêu, còn lại gì để chinh phục trong tuần này.",
          icon: Clock3
        },
        {
          title: "Lộ trình do AI đề xuất",
          description: "Machine learning phân tích lịch sử học để tinh chỉnh nội dung phù hợp nhất với bạn.",
          icon: Brain
        },
        {
          title: "Nhắc nhở thông minh",
          description: "Nhắc lịch ôn tập, đề xuất flashcard và luyện đề ngay khi bạn có thời gian rảnh.",
          icon: Sparkles
        },
        {
          title: "Chứng nhận & phần thưởng",
          description: "Hoàn thành thử thách, mở khóa huy hiệu và chia sẻ thành tựu với bạn bè.",
          icon: CheckCircle2
        }
      ],
      stats: [
        { label: "Học viên hoàn thành mục tiêu trong 3 tháng", value: "86%" },
        { label: "Bài học và thử thách được cập nhật mỗi tuần", value: "120+" },
        { label: "Chủ đề đang hoạt động cùng cộng đồng", value: "35" }
      ],
      illustration: {
        src: "/picture1.png",
        alt: "Học viên SmartLearn đang tương tác với bài học trên nền tảng",
        badge: "Học mỗi ngày chỉ 25 phút",
        caption: "AI Mentor sẽ nhắc bạn ôn tập đúng lúc nhất."
      },
      accentShapes: [
        { size: 420, position: "top-left" },
        { size: 360, position: "bottom-right" },
        { size: 280, position: "top-right" }
      ]
    }),
    []
  );

  const card: { header: AuthCardHeaderModel } = useMemo(
    () => ({
      header: {
        title: "Chào mừng",
        description: "Đăng nhập hoặc tạo tài khoản mới"
      }
    }),
    []
  );

  return {
    hero,
    card,
    tabs: AUTH_TABS,
    activeTab,
    setActiveTab,
    loginForm: {
      values: forms.login,
      onFieldChange: handleLoginChange,
      onSubmit: submitLogin,
      onGoogleSignIn: submitGoogle,
      isSubmitting: flow.isLoading,
      error: flow.error
    },
    registerForm: {
      values: forms.register,
      onFieldChange: handleRegisterChange,
      onSubmit: submitRegister,
      isSubmitting: flow.isLoading,
      error: flow.error
    }
  };
}
