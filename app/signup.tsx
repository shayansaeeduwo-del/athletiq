import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';

import { athletiq } from '@/constants/athletiq';
import { resolvePostAuthDestination } from '@/lib/post-auth-route';
import supabase from '@/lib/supabase';

const inputBorder = 'rgba(255, 255, 255, 0.12)';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
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

  async function handleCreateAccount() {
    setError(null);
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: Linking.createURL('/'),
          data: {
            full_name: fullName.trim(),
          },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert(
          'Check your email',
          'If email confirmation is enabled, open the link we sent you, then sign in.',
        );
        router.replace('/login');
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join in a few seconds.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Alex Morgan"
              placeholderTextColor={athletiq.textSubtle}
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="name"
              editable={!loading}
            />

            <Text style={[styles.label, styles.labelSpaced]}>Email</Text>
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
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleCreateAccount}
              disabled={loading}
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}>
              {loading ? (
                <ActivityIndicator color={athletiq.background} />
              ) : (
                <Text style={styles.primaryBtnText}>Create Account</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Link href="/login" asChild>
              <Pressable
                accessibilityRole="link"
                disabled={loading}
                hitSlop={12}>
                <Text style={styles.footerText}>
                  Already have an account?{' '}
                  <Text style={styles.footerAccent}>Sign in</Text>
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
    marginTop: -16,
  },
  label: {
    color: athletiq.textMuted,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  labelSpaced: {
    marginTop: 14,
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
    marginTop: 14,
  },
  primaryBtn: {
    marginTop: 22,
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
