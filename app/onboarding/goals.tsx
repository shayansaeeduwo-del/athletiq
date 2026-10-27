import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';

import { OnboardingScreenShell } from '@/components/onboarding/screen-shell';
import { PrimaryButton } from '@/components/onboarding/primary-button';
import { athletiq } from '@/constants/athletiq';
import { clearOnboardingDraft, loadOnboardingDraft, saveOnboardingDraft } from '@/lib/onboarding-data';
import supabase from '@/lib/supabase';

/** 0 = all athletics, 100 = all academics */
export default function GoalWeightingScreen() {
  const router = useRouter();
  const [academicPct, setAcademicPct] = useState(50);
  const athleticPct = 100 - academicPct;
  const [isSaving, setIsSaving] = useState(false);

  async function handleFinish() {
    try {
      setIsSaving(true);
      const merged = await saveOnboardingDraft({
        academicPriority: academicPct,
        athleticPriority: athleticPct,
      });
      const snapshot = await loadOnboardingDraft();
      const payload = { ...snapshot, ...merged };

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found.');
      }

      const { error } = await supabase.from('athlete_onboarding').upsert(
        {
          user_id: user.id,
          major: payload.major ?? null,
          year: payload.year ?? null,
          class_schedule: payload.classSchedule ?? [],
          sport: payload.sport ?? null,
          position_or_event: payload.positionOrEvent ?? null,
          practice_schedule: payload.practiceSchedule ?? null,
          academic_priority: payload.academicPriority ?? academicPct,
          athletic_priority: payload.athleticPriority ?? athleticPct,
        },
        { onConflict: 'user_id' },
      );
      if (error) {
        throw error;
      }

      await clearOnboardingDraft();
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      Alert.alert('Unable to save onboarding', message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <OnboardingScreenShell
      step={4}
      title="Goal weighting"
      subtitle="Slide to reflect what you want to prioritize this season. You can change this anytime."
      scrollable={false}
      footer={
        <PrimaryButton
          label={isSaving ? 'Saving...' : 'Finish'}
          onPress={isSaving ? () => {} : handleFinish}
        />
      }>
      <View style={styles.card}>
        <View style={styles.splitRow}>
          <View style={styles.splitBlock}>
            <Text style={styles.splitLabel}>Athletics</Text>
            <Text style={styles.splitValue}>{athleticPct}%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.splitBlock}>
            <Text style={styles.splitLabel}>Academics</Text>
            <Text style={styles.splitValue}>{academicPct}%</Text>
          </View>
        </View>

        <Text style={styles.sliderLabel}>Prioritize academics</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={academicPct}
          onValueChange={setAcademicPct}
          minimumTrackTintColor={athletiq.accent}
          maximumTrackTintColor={athletiq.border}
          thumbTintColor={athletiq.text}
        />
        <Text style={styles.hint}>
          Left emphasizes training and recovery; right emphasizes coursework and exams.
        </Text>
      </View>
    </OnboardingScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -24,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: athletiq.inputBg,
    borderWidth: 1,
    borderColor: athletiq.border,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 36,
  },
  splitBlock: {
    flex: 1,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  splitLabel: {
    color: athletiq.textMuted,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  splitValue: {
    color: athletiq.text,
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: athletiq.border,
  },
  sliderLabel: {
    color: athletiq.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 44,
  },
  hint: {
    color: athletiq.textSubtle,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
});
