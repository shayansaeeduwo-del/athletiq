import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LabeledField } from '@/components/onboarding/labeled-field';
import { OnboardingScreenShell } from '@/components/onboarding/screen-shell';
import { PrimaryButton } from '@/components/onboarding/primary-button';
import { loadOnboardingDraft, saveOnboardingDraft } from '@/lib/onboarding-data';

export default function AthleticProfileScreen() {
  const router = useRouter();
  const [sport, setSport] = useState('');
  const [positionOrEvent, setPositionOrEvent] = useState('');
  const [practiceSchedule, setPracticeSchedule] = useState('');

  useEffect(() => {
    loadOnboardingDraft().then((draft) => {
      if (draft.sport) {
        setSport(draft.sport);
      }
      if (draft.positionOrEvent) {
        setPositionOrEvent(draft.positionOrEvent);
      }
      if (draft.practiceSchedule) {
        setPracticeSchedule(draft.practiceSchedule);
      }
    });
  }, []);

  async function handleContinue() {
    try {
      await saveOnboardingDraft({
        sport: sport.trim(),
        positionOrEvent: positionOrEvent.trim(),
        practiceSchedule: practiceSchedule.trim(),
      });
      router.push('/onboarding/goals');
    } catch {
      Alert.alert('Unable to continue', 'Please try again.');
    }
  }

  return (
    <OnboardingScreenShell
      step={3}
      title="Athletic profile"
      subtitle="Tell us your sport and when you’re typically on the field or in the gym."
      footer={<PrimaryButton label="Continue" onPress={handleContinue} />}>
      <View style={styles.fields}>
        <LabeledField
          label="Sport"
          placeholder="e.g. Soccer, Swimming"
          autoCapitalize="words"
          value={sport}
          onChangeText={setSport}
        />
        <LabeledField
          label="Position or event"
          placeholder="e.g. Midfielder, 100m freestyle"
          autoCapitalize="sentences"
          value={positionOrEvent}
          onChangeText={setPositionOrEvent}
        />
        <LabeledField
          label="Practice schedule"
          placeholder={'e.g.\nMon–Fri · 6:30–8:30 AM\nSat · team lift 10 AM'}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={styles.multiline}
          value={practiceSchedule}
          onChangeText={setPracticeSchedule}
        />
      </View>
    </OnboardingScreenShell>
  );
}

const styles = StyleSheet.create({
  fields: {
    paddingTop: 4,
  },
  multiline: {
    minHeight: 120,
    paddingTop: 14,
  },
});
