import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LabeledField } from '@/components/onboarding/labeled-field';
import { OnboardingScreenShell } from '@/components/onboarding/screen-shell';
import { PrimaryButton } from '@/components/onboarding/primary-button';
import { athletiq } from '@/constants/athletiq';
import { loadOnboardingDraft, saveOnboardingDraft } from '@/lib/onboarding-data';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);

function formatHour(hour24: number) {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:00 ${period}`;
}

export default function AcademicProfileScreen() {
  const router = useRouter();
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const hourLabels = useMemo(() => HOURS.map((hour) => formatHour(hour)), []);

  const toggleSlot = (day: string, hour: number) => {
    const key = `${day}-${hour}`;
    setSelectedSlots((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  useEffect(() => {
    loadOnboardingDraft().then((draft) => {
      if (draft.major) {
        setMajor(draft.major);
      }
      if (draft.year) {
        setYear(draft.year);
      }
      if (draft.classSchedule?.length) {
        setSelectedSlots(new Set(draft.classSchedule));
      }
    });
  }, []);

  async function handleContinue() {
    try {
      await saveOnboardingDraft({
        major: major.trim(),
        year: year.trim(),
        classSchedule: Array.from(selectedSlots).sort(),
      });
      router.push('/onboarding/athletic');
    } catch {
      Alert.alert('Unable to continue', 'Please try again.');
    }
  }

  return (
    <OnboardingScreenShell
      step={2}
      title="Academic profile"
      subtitle="We use this to protect study blocks and sync with your week."
      footer={
        <PrimaryButton label="Continue" onPress={handleContinue} />
      }>
      <View style={styles.fields}>
        <LabeledField
          label="Major"
          placeholder="e.g. Computer Science"
          autoCapitalize="words"
          value={major}
          onChangeText={setMajor}
        />
        <LabeledField
          label="Year"
          placeholder="e.g. Sophomore, Junior"
          autoCapitalize="words"
          value={year}
          onChangeText={setYear}
        />
        <Text style={styles.scheduleLabel}>Class schedule</Text>
        <View style={styles.gridCard}>
          <View style={styles.headerRow}>
            <View style={styles.timeColumnHeader} />
            {DAYS.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          <ScrollView
            style={styles.scheduleScroll}
            contentContainerStyle={styles.gridBody}
            showsVerticalScrollIndicator={false}>
            {HOURS.map((hour, rowIndex) => (
              <View key={hour} style={styles.gridRow}>
                <Text style={styles.timeLabel}>{hourLabels[rowIndex]}</Text>
                {DAYS.map((day) => {
                  const slotKey = `${day}-${hour}`;
                  const isSelected = selectedSlots.has(slotKey);
                  return (
                    <Pressable
                      key={slotKey}
                      onPress={() => toggleSlot(day, hour)}
                      style={({ pressed }) => [
                        styles.slotPill,
                        isSelected ? styles.slotPillSelected : styles.slotPillDefault,
                        pressed && { opacity: 0.82 },
                      ]}>
                      <Text
                        style={[
                          styles.slotPillText,
                          isSelected ? styles.slotPillTextSelected : styles.slotPillTextDefault,
                        ]}>
                        {isSelected ? 'On' : 'Off'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </OnboardingScreenShell>
  );
}

const styles = StyleSheet.create({
  fields: {
    paddingTop: 4,
  },
  scheduleLabel: {
    color: athletiq.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  gridCard: {
    borderRadius: 12,
    backgroundColor: athletiq.inputBg,
    borderWidth: 1,
    borderColor: athletiq.border,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: athletiq.border,
  },
  timeColumnHeader: {
    width: 60,
  },
  dayHeader: {
    flex: 1,
    color: athletiq.text,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  scheduleScroll: {
    maxHeight: 360,
  },
  gridBody: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    marginBottom: 6,
  },
  timeLabel: {
    width: 60,
    color: athletiq.textSubtle,
    fontSize: 10,
    fontWeight: '500',
    paddingRight: 8,
  },
  slotPill: {
    flex: 1,
    height: 30,
    marginHorizontal: 2,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotPillDefault: {
    backgroundColor: '#1e1e1e',
  },
  slotPillSelected: {
    backgroundColor: athletiq.accent,
  },
  slotPillText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  slotPillTextDefault: {
    color: athletiq.text,
  },
  slotPillTextSelected: {
    color: athletiq.background,
  },
});
