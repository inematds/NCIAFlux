/**
 * NCIAFlux Design System Constants
 * Based on front-end-spec.md
 */

export const COLORS = {
  // Primary Palette
  primary: {
    main: '#4A90A4', // Azul-petróleo calmante
    light: '#6BA8BC',
    dark: '#3A7284',
    contrast: '#FFFFFF',
  },

  // Secondary Palette
  secondary: {
    main: '#E8A87C', // Pêssego acolhedor
    light: '#F0C4A6',
    dark: '#D08A5C',
    contrast: '#1A1A1A',
  },

  // Accent Colors
  accent: {
    success: '#85C88A', // Verde suave
    warning: '#F0C674', // Amarelo gentil
    error: '#E57373', // Vermelho suave
    info: '#64B5F6', // Azul informativo
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },

  // Crisis Mode Colors
  crisis: {
    background: '#E8EEF2',
    backgroundEnd: '#F5F7FA',
    text: '#2D3748',
    card: '#FFFFFF',
  },

  // Energy Level Colors
  energy: {
    high: '#85C88A',
    medium: '#F0C674',
    low: '#E8A87C',
  },
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    primary: 'Inter',
    fallback: 'system-ui, -apple-system, sans-serif',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;
