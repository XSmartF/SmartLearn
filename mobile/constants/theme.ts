/**
 * SmartLearn mobile design tokens — matching web theme.
 *
 * Purple-pastel primary • neumorphic surfaces • glassmorphism accents.
 * Palette derived from the web CSS variables (oklch → hex approximations).
 */

// ── Brand palette (web parity) ────────────────────────────────
export const Brand = {
  /** Primary purple */
  primary: '#8b5cf6',
  primaryLight: '#a78bfa',
  primaryDark: '#7c3aed',
  /** Secondary / accent */
  secondary: '#c4b5fd',
  accent: '#a855f7',
  /** Chart colours (web parity) */
  chart1: '#8b5cf6', // purple
  chart2: '#38bdf8', // sky-blue
  chart3: '#34d399', // emerald
  chart4: '#fbbf24', // amber
  chart5: '#f472b6', // pink
  /** Semantic */
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  /** Surfaces – light */
  white: '#FFFFFF',
  lightBg: '#F4F2F7',
  lightCard: '#FFFFFF',
  lightBorder: '#E2DFF0',
  lightMuted: '#EEEDF5',
  /** Surfaces – dark */
  dark: '#1A1625',
  darkCard: '#231F36',
  darkSurface: '#2E2A42',
  darkBorder: '#3D3759',
  /** Neutrals */
  gray100: '#F3F2F8',
  gray200: '#E4E2F0',
  gray300: '#B8B5CA',
  gray400: '#8A87A0',
  gray500: '#6B6882',
  gray600: '#48465E',
} as const;

// ── Neumorphic shadow presets ──────────────────────────────────
export const NeuShadow = {
  sm: {
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  lg: {
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 22,
    elevation: 8,
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 4,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.40,
      shadowRadius: 16,
      elevation: 6,
    },
  },
} as const;

// ── Theme colours (light / dark) ───────────────────────────────
export const Colors = {
  light: {
    text: '#1A1625',
    textSecondary: Brand.gray500,
    background: Brand.lightBg,
    card: Brand.lightCard,
    cardBorder: Brand.lightBorder,
    muted: Brand.lightMuted,
    tint: Brand.primary,
    accent: Brand.accent,
    icon: Brand.gray400,
    tabIconDefault: Brand.gray400,
    tabIconSelected: Brand.primary,
    tabBar: Brand.white,
    inputBg: Brand.white,
    inputBorder: Brand.lightBorder,
    /** Neumorphic surface that is slightly off-white */
    neuBg: '#ECEAF3',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: Brand.gray300,
    background: Brand.dark,
    card: Brand.darkCard,
    cardBorder: Brand.darkBorder,
    muted: Brand.darkSurface,
    tint: Brand.primaryLight,
    accent: Brand.accent,
    icon: Brand.gray400,
    tabIconDefault: Brand.gray400,
    tabIconSelected: Brand.primaryLight,
    tabBar: Brand.darkCard,
    inputBg: Brand.darkSurface,
    inputBorder: Brand.darkBorder,
    neuBg: Brand.darkSurface,
  },
};

// ── Radius scale ──────────────────────────────────────────────
export const Radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 999,
} as const;
