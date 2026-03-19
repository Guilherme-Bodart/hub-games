import { create } from 'zustand';

import { defaultThemeName } from '@/src/theme/themes';
import { ThemeName } from '@/src/theme/types';

type ThemeState = {
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  themeName: defaultThemeName,
  setTheme: (themeName) => set({ themeName }),
}));

export const setTheme = (themeName: ThemeName): void => {
  useThemeStore.getState().setTheme(themeName);
};
