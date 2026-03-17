// Design tokens from designprompt.md — Dark-only system
export const colors = {
  // Surfaces
  surface: '#0A0F1E',
  surfaceCard: '#0F172A',

  // Glass tokens
  glassBg: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  glassHighlight: 'rgba(255, 255, 255, 0.35)',
  glassCardBg: 'rgba(15, 23, 42, 0.6)',
  glassCardBorder: 'rgba(255, 255, 255, 0.10)',

  // Brand
  primary: '#2563EB',
  primaryGlow: '#3B82F6',
  shadowBlue: 'rgba(37, 99, 235, 0.4)',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: 'rgba(148, 163, 184, 0.6)',

  // Accents
  accentGreen: '#10B981',
  accentAmber: '#F59E0B',
  destructive: '#EF4444',

  // Pill backgrounds
  greenPillBg: 'rgba(16, 185, 129, 0.15)',
  greenPillBorder: 'rgba(16, 185, 129, 0.3)',
  amberPillBg: 'rgba(245, 158, 11, 0.15)',
  amberPillBorder: 'rgba(245, 158, 11, 0.3)',

  // Legacy aliases (keep for any screens not yet updated)
  primary_old: '#3b82f6',
  white: '#F8FAFC',
  transparent: 'transparent',
};

// Typography scale (px values for fontSize)
export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
  '4xl': 48,
};

// Spacing grid — strict multiples of 4
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
};

// Spring config for all interactive press states
export const springConfig = {
  damping: 18,
  stiffness: 220,
  mass: 0.8,
};

// Glass card style spec — apply to any card surface
export const glassCard = {
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.10)',
  borderRadius: 24,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.4,
  shadowRadius: 32,
  elevation: 10,
};
