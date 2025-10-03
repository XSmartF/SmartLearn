import type { LucideIcon } from "lucide-react";

export type AuthTabId = "login" | "register";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string;
}

export type AuthSubmissionStatus = "idle" | "loading" | "success" | "error";

export interface AuthTabConfig {
  id: AuthTabId;
  label: string;
  description?: string;
  icon: LucideIcon;
}

export interface AuthHeroFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface AuthHeroStat {
  label: string;
  value: string;
}

export interface AuthHeroIllustration {
  src: string;
  alt: string;
  badge?: string;
  caption?: string;
}

export interface AuthHeroModel {
  brand: {
    name: string;
    logoSrc: string;
    logoAlt: string;
    tagline: string;
  };
  eyebrow: string;
  headline: string;
  subheadline: string;
  description: string;
  features: AuthHeroFeature[];
  stats: AuthHeroStat[];
  illustration: AuthHeroIllustration;
  accentShapes: Array<{ size: number; position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }>;
}

export interface AuthCardHeaderModel {
  title: string;
  description: string;
}
