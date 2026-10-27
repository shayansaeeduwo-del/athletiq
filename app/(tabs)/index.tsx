import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { athletiq } from '@/constants/athletiq';
import supabase from '@/lib/supabase';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const CATEGORY_COLORS = {
  class: '#f6f6f6',
  practice: '#00ff87',
  study: '#2b2b2b',
  sleep: '#112244',
  meals: '#ff9f43',
  recovery: '#6f4bff',
} as const;
const CATEGORY_TEXT_COLORS = {
  class: '#111111',
  practice: '#04180f',
  study: '#f0f0f0',
  sleep: '#f0f4ff',
  meals: '#201103',
  recovery: '#f4efff',
} as const;
const GRID_START_HOUR = 6;
const GRID_END_HOUR = 23;
const ROW_HEIGHT = 44;
const TIME_COL_WIDTH = 54;
const borderSoft = 'rgba(255, 255, 255, 0.08)';
const borderGrid = 'rgba(255, 255, 255, 0.06)';

function formatHour(hour24: number) {
  const period = hour24 >= 12 ? 'pm' : 'am';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}${period}`;
}

function parseTimeToMinutes(value: string) {
  const normalized = value.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (!match) {
    throw new Error(`Invalid time: ${value}`);
  }
  const hour = Number(match[1]);
  const minute = Number(match[2] ?? '0');
  let hour24 = hour % 12;
  if (match[3] === 'PM') {
    hour24 += 12;
  }
  return hour24 * 60 + minute;
}

function normalizeClaudeJson(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return withoutFence;
}

type ScheduleCategory = keyof typeof CATEGORY_COLORS;
type ScheduleBlock = {
  day: (typeof DAYS)[number];
  startTime: string;
  endTime: string;
  title: string;
  category: ScheduleCategory;
};

const TIME_SLOTS = Array.from(
  { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
  (_, idx) => formatHour(idx + GRID_START_HOUR),
);

export default function HomeScreen() {
  const currentDayIndex = (new Date().getDay() + 6) % 7;
  const pulse = useRef(new Animated.Value(1)).current;
  const [isGenerating, setIsGenerating] = useState(false);
  const [calendarWidth, setCalendarWidth] = useState(0);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);

  useEffect(() => {
    if (!isGenerating) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.78, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isGenerating, pulse]);

  const dayColumnWidth = useMemo(() => {
    const width = calendarWidth - TIME_COL_WIDTH;
    return width > 0 ? width / DAYS.length : 0;
  }, [calendarWidth]);

  const gridDurationMinutes = (GRID_END_HOUR - GRID_START_HOUR + 1) * 60;

  async function fetchOnboardingData() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('No authenticated user found.');
    }

    const onboardingData: Record<string, unknown> = {
      userId: user.id,
      metadata: user.user_metadata ?? {},
    };

    const tableCandidates = ['athlete_onboarding', 'onboarding_profiles', 'profiles', 'athletes'];
    for (const table of tableCandidates) {
      const byUserId = await supabase.from(table).select('*').eq('user_id', user.id).maybeSingle();
      if (!byUserId.error && byUserId.data) {
        onboardingData.profileTable = table;
        onboardingData.profile = byUserId.data;
        break;
      }
      const byId = await supabase.from(table).select('*').eq('id', user.id).maybeSingle();
      if (!byId.error && byId.data) {
        onboardingData.profileTable = table;
        onboardingData.profile = byId.data;
        break;
      }
    }

    return onboardingData;
  }

  function parseScheduleBlocks(rawText: string): ScheduleBlock[] {
    const parsed = JSON.parse(normalizeClaudeJson(rawText)) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error('Claude did not return a JSON array.');
    }
    return parsed
      .filter((item): item is ScheduleBlock => {
        if (!item || typeof item !== 'object') {
          return false;
        }
        const obj = item as Record<string, unknown>;
        return (
          typeof obj.day === 'string' &&
          typeof obj.startTime === 'string' &&
          typeof obj.endTime === 'string' &&
          typeof obj.title === 'string' &&
          typeof obj.category === 'string' &&
          DAYS.includes(obj.day as (typeof DAYS)[number]) &&
          Object.prototype.hasOwnProperty.call(CATEGORY_COLORS, String(obj.category).toLowerCase())
        );
      })
      .map((block) => ({
        ...block,
        category: block.category.toLowerCase() as ScheduleCategory,
      }));
  }

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const onboardingData = await fetchOnboardingData();
      const extra =
        Constants.expoConfig?.extra ??
        Constants.manifest2?.extra ??
        Constants.manifest?.extra ??
        {};
      const anthropicApiKey =
        extra.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY ?? process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

      if (!anthropicApiKey) {
        throw new Error('Missing ANTHROPIC_API_KEY.');
      }

      const prompt = `You are an AI scheduler for student athletes. Based on this athlete's data: ${JSON.stringify(onboardingData)} , generate an optimized weekly schedule. Return ONLY a JSON array of schedule blocks, each with: day (Mon/Tue/Wed/Thu/Fri/Sat/Sun), startTime (e.g. 8:00 AM), endTime, title, and category (class/practice/study/sleep/meals/recovery).`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1400,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error (${response.status}).`);
      }

      const payload = (await response.json()) as {
        content?: Array<{ type?: string; text?: string }>;
      };
      const textContent = payload.content?.find((item) => item.type === 'text')?.text;
      if (!textContent) {
        throw new Error('No text response returned from Anthropic.');
      }

      const blocks = parseScheduleBlocks(textContent);
      setScheduleBlocks(blocks);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Schedule generation failed', message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, Athlete</Text>
          <View style={styles.wordmarkRow}>
            <View style={styles.logoDot} />
            <Text style={styles.wordmark}>AthletiQ</Text>
          </View>
        </View>
      </View>

      <View style={styles.weekStrip}>
        {DAYS.map((day, idx) => {
          const active = idx === currentDayIndex;
          return (
            <View key={day} style={[styles.dayChip, active && styles.dayChipActive]}>
              <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{day}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.calendarFrame} onLayout={(event) => setCalendarWidth(event.nativeEvent.layout.width)}>
        <View style={styles.gridHeader}>
          <View style={styles.timeHeaderCell} />
          {DAYS.map((day) => (
            <Text key={`head-${day}`} style={styles.gridDayHeader}>
              {day}
            </Text>
          ))}
        </View>

        <ScrollView style={styles.calendarScroll} contentContainerStyle={styles.calendarContent}>
          {scheduleBlocks.length === 0 ? (
            <View pointerEvents="none" style={styles.emptyStateWrap}>
              <Text style={styles.emptyStateText}>Your schedule will appear here</Text>
            </View>
          ) : null}

          {scheduleBlocks.length > 0 && dayColumnWidth > 0 ? (
            <View pointerEvents="none" style={styles.overlay}>
              {scheduleBlocks.map((block, idx) => {
                const dayIndex = DAYS.indexOf(block.day);
                if (dayIndex < 0) {
                  return null;
                }
                const startMinutes = parseTimeToMinutes(block.startTime);
                const endMinutes = parseTimeToMinutes(block.endTime);
                const clampedStart = Math.max(startMinutes, GRID_START_HOUR * 60);
                const clampedEnd = Math.min(endMinutes, (GRID_END_HOUR + 1) * 60);
                const duration = Math.max(clampedEnd - clampedStart, 30);
                const top = ((clampedStart - GRID_START_HOUR * 60) / gridDurationMinutes) * ROW_HEIGHT * TIME_SLOTS.length;
                const height = (duration / gridDurationMinutes) * ROW_HEIGHT * TIME_SLOTS.length;

                return (
                  <View
                    key={`${block.day}-${block.startTime}-${block.endTime}-${block.title}-${idx}`}
                    style={[
                      styles.scheduleBlock,
                      {
                        backgroundColor: CATEGORY_COLORS[block.category],
                        left: TIME_COL_WIDTH + dayIndex * dayColumnWidth + 3,
                        width: dayColumnWidth - 6,
                        top,
                        height: Math.max(24, height),
                      },
                    ]}>
                    <Text style={[styles.scheduleBlockTitle, { color: CATEGORY_TEXT_COLORS[block.category] }]}>
                      {block.title}
                    </Text>
                    <Text style={[styles.scheduleBlockTime, { color: CATEGORY_TEXT_COLORS[block.category] }]}>
                      {block.startTime} - {block.endTime}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {TIME_SLOTS.map((slot) => (
            <View key={slot} style={styles.timeRow}>
              <Text style={styles.timeLabel}>{slot}</Text>
              <View style={styles.dayCellsRow}>
                {DAYS.map((day) => (
                  <View key={`${day}-${slot}`} style={styles.dayCell} />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.floatingWrap}>
        <Pressable
          style={({ pressed }) => [styles.generateBtn, pressed && styles.generateBtnPressed]}
          onPress={handleGenerate}
          accessibilityRole="button"
          accessibilityLabel="Generate My Schedule"
          disabled={isGenerating}>
          <Animated.Text style={[styles.generateBtnText, isGenerating && { opacity: pulse }]}>
            {isGenerating ? '✦ Generating...' : '✦ Generate My Schedule'}
          </Animated.Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: athletiq.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 14,
  },
  greeting: {
    color: athletiq.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.9,
  },
  wordmarkRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: athletiq.accent,
  },
  wordmark: {
    color: athletiq.accent,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  weekStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dayChip: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderSoft,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  dayChipActive: {
    backgroundColor: athletiq.accent,
    borderColor: athletiq.accent,
  },
  dayChipText: {
    color: athletiq.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dayChipTextActive: {
    color: athletiq.background,
  },
  calendarFrame: {
    flex: 1,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: borderSoft,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },
  gridHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: borderGrid,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  timeHeaderCell: {
    width: 54,
  },
  gridDayHeader: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    color: athletiq.textSubtle,
    fontSize: 11,
    fontWeight: '600',
    borderLeftWidth: 1,
    borderLeftColor: borderGrid,
    letterSpacing: 0.2,
  },
  calendarScroll: {
    flex: 1,
  },
  calendarContent: {
    paddingBottom: 72,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  emptyStateWrap: {
    position: 'absolute',
    top: 170,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  emptyStateText: {
    color: athletiq.textSubtle,
    fontSize: 15,
    letterSpacing: 0.15,
  },
  scheduleBlock: {
    position: 'absolute',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scheduleBlockTitle: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  scheduleBlockTime: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '500',
    opacity: 0.9,
  },
  timeRow: {
    minHeight: 44,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: borderGrid,
  },
  timeLabel: {
    width: 54,
    color: athletiq.textSubtle,
    fontSize: 10,
    textAlign: 'center',
    paddingTop: 6,
    letterSpacing: 0.2,
  },
  dayCellsRow: {
    flex: 1,
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: borderGrid,
  },
  floatingWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
  },
  generateBtn: {
    backgroundColor: athletiq.accent,
    borderRadius: 14,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ff87',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  generateBtnPressed: {
    opacity: 0.9,
  },
  generateBtnText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
