/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  //No se utilizan temas inicialmente
  light: {
  },
  dark: {
  },
  primary:        '#f97316',  // naranja principal
  primaryLight:   '#ffedd5',  // naranja suave
  primaryFaint:   '#fff7ed',  // naranja muy suave
  background:     '#f3f4f6',  // blanco fondo
  surface:        '#ffffff',
  border:         '#e5e7eb',  // gris claro borde inputs
  borderLight:    '#f3f4f6',
  text:           '#111827',  // negro texto
  textSoft:       '#374151',  // gris oscuro texto
  textFaint:      '#9ca3af',  // gris claro texto
  textMuted:      '#6b7280',  // gris medio para icono cancelar
  shadow:         '#000000',   // negro sombra
  delete:         '#ef4444'
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
