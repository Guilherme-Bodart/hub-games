import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useThemeStore } from '@/src/theme/store';
import {
  defaultThemeName,
  getTheme,
  isThemeName,
  themeOptions,
} from '@/src/theme/themes';
import { ThemeName, ThemeTokens } from '@/src/theme/types';

const THEME_STORAGE_KEY = 'hub-games:theme-name';

type ThemeContextValue = {
  themeName: ThemeName;
  theme: ThemeTokens;
  options: typeof themeOptions;
  isHydrated: boolean;
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const themeName = useThemeStore((state) => state.themeName);
  const updateTheme = useThemeStore((state) => state.setTheme);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isActive = true;

    const restoreTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (isActive && storedTheme && isThemeName(storedTheme)) {
          updateTheme(storedTheme);
        }
      } finally {
        if (isActive) {
          setIsHydrated(true);
        }
      }
    };

    restoreTheme();

    return () => {
      isActive = false;
    };
  }, [updateTheme]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(THEME_STORAGE_KEY, themeName).catch(() => undefined);
  }, [isHydrated, themeName]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      theme: getTheme(themeName),
      options: themeOptions,
      isHydrated,
      setTheme: updateTheme,
    }),
    [isHydrated, themeName, updateTheme]
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
