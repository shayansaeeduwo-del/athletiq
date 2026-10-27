import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

import { athletiq } from '@/constants/athletiq';
import supabase from '@/lib/supabase';

export default function OnboardingLayout() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) {
        return;
      }
      if (!session) {
        router.replace('/login');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: athletiq.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
