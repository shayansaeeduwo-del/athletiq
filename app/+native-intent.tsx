import * as Linking from 'expo-linking';

import { applySupabaseAuthDeepLink, hasSupabaseAuthPayload } from '@/lib/auth-deeplink';

/**
 * Expo Router passes the system deep link here before it maps to a route.
 * Supabase email confirmations use athletiq://…#access_token=… which would otherwise
 * become an invalid path (#…) and render a blank screen. We exchange the session first,
 * then send the router to the app root so `app/index.tsx` can run post-auth routing.
 */
export async function redirectSystemPath({
  path,
  initial: _initial,
}: {
  path: string;
  initial: boolean;
}): Promise<string> {
  if (typeof path === 'string' && hasSupabaseAuthPayload(path)) {
    await applySupabaseAuthDeepLink(path);
    return Linking.createURL('/');
  }
  return path;
}
