import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { defaultThemeName, getTheme, themeOptions } from '@/src/theme/themes';
import { ThemeName, ThemeTokens } from '@/src/theme/types';

type ThemeContextValue = {
  themeName: ThemeName;
  theme: ThemeTokens;
  options: typeof themeOptions;
  isHydrated: boolean;
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName: defaultThemeName,
      theme: getTheme(defaultThemeName),
      options: themeOptions,
      isHydrated: true,
      setTheme: () => undefined,
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemePreviewProvider({
  children,
  themeName = defaultThemeName,
}: PropsWithChildren<{ themeName?: ThemeName }>) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      theme: getTheme(themeName),
      options: themeOptions,
      isHydrated: true,
      setTheme: () => undefined,
    }),
    [themeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider.');
  }

  return context;
}
