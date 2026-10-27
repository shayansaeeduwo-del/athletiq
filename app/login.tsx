import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { athletiq } from '@/constants/athletiq';
import { resolvePostAuthDestination } from '@/lib/post-auth-route';
import supabase from '@/lib/supabase';

const inputBorder = 'rgba(255, 255, 255, 0.12)';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled || !session?.user) {
        return;
      }
      const dest = await resolvePostAuthDestination();
      if (!cancelled) {
        router.replace(dest);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      const dest = await resolvePostAuthDestination();
      router.replace(dest);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.logo}>AthletiQ</Text>
            <View style={styles.accentLine} />
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Welcome back.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={athletiq.textSubtle}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading}
            />

            <Text style={[styles.label, styles.labelSpaced]}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={athletiq.textSubtle}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              editable={!loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}>
              {loading ? (
                <ActivityIndicator color={athletiq.background} />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Link href="/signup" asChild>
              <Pressable
                accessibilityRole="link"
                disabled={loading}
                hitSlop={12}>
                <Text style={styles.footerText}>
                  {"Don't have an account? "}
                  <Text style={styles.footerAccent}>Sign up</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: athletiq.background,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 16,
  },
  header: {
    gap: 8,
  },
  logo: {
    color: athletiq.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: athletiq.accent,
    borderRadius: 2,
    marginTop: 4,
  },
  title: {
    color: athletiq.text,
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.4,
    marginTop: 28,
  },
  subtitle: {
    color: athletiq.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -24,
  },
  label: {
    color: athletiq.textMuted,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  labelSpaced: {
    marginTop: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: athletiq.text,
    backgroundColor: athletiq.inputBg,
  },
  error: {
    color: 'rgba(255, 120, 120, 0.95)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
  },
  primaryBtn: {
    marginTop: 24,
    backgroundColor: athletiq.accent,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryBtnDisabled: {
    opacity: 0.85,
  },
  primaryBtnText: {
    color: athletiq.background,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    color: athletiq.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  footerAccent: {
    color: athletiq.accent,
    fontWeight: '600',
  },
});
