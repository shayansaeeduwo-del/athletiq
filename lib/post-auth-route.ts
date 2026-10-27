import supabase from './supabase';

export type PostAuthDestination = '/onboarding' | '/(tabs)';

/**
 * After a successful sign-in (session present), send the user to onboarding
 * until they have a row in `athlete_onboarding`, then home (tabs).
 */
export async function resolvePostAuthDestination(): Promise<PostAuthDestination> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return '/onboarding';
  }

  const { data, error } = await supabase
    .from('athlete_onboarding')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return '/onboarding';
  }

  return data ? '/(tabs)' : '/onboarding';
}
