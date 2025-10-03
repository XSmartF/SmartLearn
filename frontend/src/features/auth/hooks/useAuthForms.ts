import { useCallback, useState } from "react";
import type { LoginCredentials, RegisterCredentials } from "@/features/auth/types";

const LOGIN_INITIAL_STATE: LoginCredentials = {
  email: "",
  password: ""
};

const REGISTER_INITIAL_STATE: RegisterCredentials = {
  email: "",
  password: "",
  displayName: ""
};

export function useAuthForms() {
  const [login, setLogin] = useState<LoginCredentials>(LOGIN_INITIAL_STATE);
  const [register, setRegister] = useState<RegisterCredentials>(REGISTER_INITIAL_STATE);

  const updateLoginField = useCallback(<K extends keyof LoginCredentials>(field: K, value: LoginCredentials[K]) => {
    setLogin((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateRegisterField = useCallback(
    <K extends keyof RegisterCredentials>(field: K, value: RegisterCredentials[K]) => {
      setRegister((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForms = useCallback(() => {
    setLogin(LOGIN_INITIAL_STATE);
    setRegister(REGISTER_INITIAL_STATE);
  }, []);

  return {
    login,
    register,
    updateLoginField,
    updateRegisterField,
    resetForms
  } as const;
}
