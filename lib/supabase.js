import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

function getExtra() {
  return (
    Constants.expoConfig?.extra ??
    Constants.manifest2?.extra ??
    Constants.manifest?.extra ??
    undefined
  );
}

function resolveCredentials() {
  const extra = getExtra();
  return {
    url:
      extra?.supabaseUrl ??
      process.env.EXPO_PUBLIC_SUPABASE_URL ??
      process.env.SUPABASE_URL,
    anonKey:
      extra?.supabaseAnonKey ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY,
  };
}

let client;

function getClient() {
  if (!client) {
    const { url, anonKey } = resolveCredentials();
    if (!url || !anonKey) {
      throw new Error(
        'Missing Supabase credentials. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env and restart Expo (they are passed through app.config.js extra).',
      );
    }
    client = createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/** Lazy client so missing env does not crash the app until auth is used. */
const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const c = getClient();
      const value = c[prop];
      return typeof value === 'function' ? value.bind(c) : value;
    },
  },
);

export default supabase;
