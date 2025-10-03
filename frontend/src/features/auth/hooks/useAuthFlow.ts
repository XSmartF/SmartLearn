import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuthRedux";
import { ROUTES } from "@/shared/constants/routes";
import type { AuthSubmissionStatus, LoginCredentials, RegisterCredentials } from "@/features/auth/types";

const extractMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
};

export function useAuthFlow() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [status, setStatus] = useState<AuthSubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const begin = useCallback(() => {
    setStatus("loading");
    setError(null);
  }, []);

  const succeed = useCallback(() => {
    setStatus("success");
  }, []);

  const fail = useCallback((message: string) => {
    setStatus("error");
    setError(message);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setStatus((prev) => (prev === "error" ? "idle" : prev));
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      begin();
      try {
        await signIn(credentials.email, credentials.password);
        succeed();
        navigate(ROUTES.HOME, { replace: true });
      } catch (err) {
        fail(extractMessage(err, "Đăng nhập thất bại"));
      }
    },
    [begin, fail, navigate, signIn, succeed]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      begin();
      try {
        await signUp(credentials.email, credentials.password, credentials.displayName);
        succeed();
        navigate(ROUTES.HOME, { replace: true });
      } catch (err) {
        fail(extractMessage(err, "Đăng ký thất bại"));
      }
    },
    [begin, fail, navigate, signUp, succeed]
  );

  const googleSignIn = useCallback(async () => {
    begin();
    try {
      await signInWithGoogle();
      succeed();
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      fail(extractMessage(err, "Đăng nhập với Google thất bại"));
    }
  }, [begin, fail, navigate, signInWithGoogle, succeed]);

  return {
    status,
    error,
    isLoading: status === "loading",
    actions: {
      login,
      register,
      googleSignIn,
      resetError
    }
  } as const;
}
