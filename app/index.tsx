import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { athletiq } from '@/constants/athletiq';
import { resolvePostAuthDestination } from '@/lib/post-auth-route';
import supabase from '@/lib/supabase';

/**
 * Entry routing: no session → login; else use resolvePostAuthDestination()
 * (onboarding welcome vs tabs). Uses imperative navigation so we never render a blank
 * frame after auth (including email-confirm deep links handled in +native-intent).
 */
export default function Index() {
  const [routing, setRouting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled) {
          return;
        }
        if (!session?.user) {
          router.replace('/login');
          return;
        }
        const dest = await resolvePostAuthDestination();
        if (cancelled) {
          return;
        }
        router.replace(dest);
      } catch {
        if (!cancelled) {
          router.replace('/login');
        }
      } finally {
        if (!cancelled) {
          setRouting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.splash}>
      <Text style={styles.splashWordmark}>AthletiQ</Text>
      <View style={styles.splashAccent} />
      <ActivityIndicator color={athletiq.accent} style={styles.spinner} animating={routing} />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: athletiq.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashWordmark: {
    color: athletiq.accent,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  splashAccent: {
    marginTop: 12,
    width: 44,
    height: 3,
    borderRadius: 2,
    backgroundColor: athletiq.accent,
    opacity: 0.5,
  },
  spinner: {
    marginTop: 28,
  },
});
