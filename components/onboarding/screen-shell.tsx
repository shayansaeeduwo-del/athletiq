import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { athletiq } from '@/constants/athletiq';

type Props = {
  title: string;
  subtitle?: string;
  step: number;
  totalSteps?: number;
  children: ReactNode;
  scrollable?: boolean;
  footer?: ReactNode;
  showBack?: boolean;
};

export function OnboardingScreenShell({
  title,
  subtitle,
  step,
  totalSteps = 4,
  children,
  scrollable = true,
  footer,
  showBack = true,
}: Props) {
  const router = useRouter();

  const body = (
    <>
      <View style={styles.headerRow}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={styles.stepPill}>
          {step} / {totalSteps}
        </Text>
        <View style={styles.backPlaceholder} />
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]}
        />
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.nonScroll}>{children}</View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {body}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  backLabel: {
    color: athletiq.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  backPlaceholder: {
    width: 48,
  },
  stepPill: {
    color: athletiq.textSubtle,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 3,
    backgroundColor: athletiq.border,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 28,
  },
  progressFill: {
    height: '100%',
    backgroundColor: athletiq.accent,
    borderRadius: 2,
  },
  title: {
    color: athletiq.text,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  subtitle: {
    color: athletiq.textMuted,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  nonScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: athletiq.border,
  },
});
