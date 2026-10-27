import { useEffect } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { athletiq } from '@/constants/athletiq';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { applySupabaseAuthDeepLink, hasSupabaseAuthPayload } from '@/lib/auth-deeplink';
import { resolvePostAuthDestination } from '@/lib/post-auth-route';

const athletiqNavigationDark: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: athletiq.background,
    card: athletiq.background,
    primary: athletiq.accent,
    text: athletiq.text,
    border: athletiq.border,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const base = colorScheme === 'dark' ? athletiqNavigationDark : DefaultTheme;

  useEffect(() => {
    const sub = Linking.addEventListener('url', async ({ url }) => {
      if (!hasSupabaseAuthPayload(url)) {
        return;
      }
      const ok = await applySupabaseAuthDeepLink(url);
      if (ok) {
        const dest = await resolvePostAuthDestination();
        router.replace(dest);
      }
    });
    return () => sub.remove();
  }, [router]);

  return (
    <ThemeProvider value={base}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
