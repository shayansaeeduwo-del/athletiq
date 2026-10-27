import supabase from './supabase';

type ParsedAuth = {
  access_token?: string;
  refresh_token?: string;
  code?: string;
};

/**
 * Parse Supabase auth params from a URL, fragment, or Expo Router–mangled path.
 * Supports:
 * - athletiq://…#access_token=…&refresh_token=…
 * - …?code=… (PKCE)
 * - Leading #fragment only (Expo Router can surface this after scheme stripping)
 */
export function parseSupabaseAuthParamsFromUrl(url: string): ParsedAuth {
  const out: ParsedAuth = {};
  if (!url) {
    return out;
  }
  try {
    if (url.startsWith('#')) {
      const params = new URLSearchParams(url.slice(1));
      out.access_token = params.get('access_token') ?? undefined;
      out.refresh_token = params.get('refresh_token') ?? undefined;
      out.code = params.get('code') ?? undefined;
      return out;
    }

    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const params = new URLSearchParams(url.slice(hashIndex + 1));
      out.access_token = params.get('access_token') ?? undefined;
      out.refresh_token = params.get('refresh_token') ?? undefined;
      out.code = params.get('code') ?? undefined;
    }

    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const beforeHash = url.slice(queryIndex + 1).split('#')[0];
      const params = new URLSearchParams(beforeHash);
      out.code ??= params.get('code') ?? undefined;
      out.access_token ??= params.get('access_token') ?? undefined;
      out.refresh_token ??= params.get('refresh_token') ?? undefined;
    }
  } catch {
    /* ignore */
  }
  return out;
}

export function hasSupabaseAuthPayload(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  const { access_token, refresh_token, code } = parseSupabaseAuthParamsFromUrl(url);
  return Boolean(code || (access_token && refresh_token));
}

/**
 * @deprecated Prefer hasSupabaseAuthPayload — kept for call sites that only want athletiq: scheme.
 */
export function isAthletiqAuthDeepLink(url: string | null | undefined): boolean {
  if (!url || !url.startsWith('athletiq:')) {
    return false;
  }
  return hasSupabaseAuthPayload(url);
}

/**
 * Applies session from a callback URL or mangled path string. Returns true if a session was set.
 */
export async function applySupabaseAuthDeepLink(url: string): Promise<boolean> {
  if (!hasSupabaseAuthPayload(url)) {
    return false;
  }

  const { access_token, refresh_token, code } = parseSupabaseAuthParamsFromUrl(url);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return !error;
  }

  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    return !error;
  }

  return false;
}
