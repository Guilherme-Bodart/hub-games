import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';

export default function TabLayout() {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.semantic.button.primary.bg,
        tabBarInactiveTintColor: theme.semantic.text.muted,
        tabBarStyle: {
          backgroundColor: theme.semantic.bg.surface,
          borderTopColor: theme.semantic.border.subtle,
        },
        headerStyle: {
          backgroundColor: theme.semantic.bg.surface,
        },
        headerTintColor: theme.semantic.text.primary,
        headerTitleStyle: {
          fontFamily: theme.semantic.typography.titleFamily,
          fontWeight: theme.semantic.typography.titleWeight,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.catalog'),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'sparkles.rectangle.stack', android: 'dashboard', web: 'dashboard' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
