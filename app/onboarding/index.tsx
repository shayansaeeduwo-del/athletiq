import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/onboarding/primary-button';
import { athletiq } from '@/constants/athletiq';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.wordmark}>AthletiQ</Text>
          <View style={styles.accentLine} />
          <Text style={styles.tagline}>Train smarter. Schedule clearer.</Text>
          <Text style={styles.body}>
            Your AI-powered companion for balancing academics and athletics—built for
            student athletes.
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Get started" onPress={() => router.push('/onboarding/academic')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: athletiq.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  hero: {
    gap: 16,
  },
  wordmark: {
    color: athletiq.text,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  accentLine: {
    width: 48,
    height: 3,
    backgroundColor: athletiq.accent,
    borderRadius: 2,
    marginTop: 4,
  },
  tagline: {
    color: athletiq.text,
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: -0.3,
    lineHeight: 28,
    marginTop: 8,
  },
  body: {
    color: athletiq.textMuted,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 12,
  },
});
