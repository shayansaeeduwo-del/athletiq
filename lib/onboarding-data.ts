import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingDraft = {
  major?: string;
  year?: string;
  classSchedule?: string[];
  sport?: string;
  positionOrEvent?: string;
  practiceSchedule?: string;
  academicPriority?: number;
  athleticPriority?: number;
};

const STORAGE_KEY = 'athletiq:onboarding-draft';

export async function loadOnboardingDraft(): Promise<OnboardingDraft> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as OnboardingDraft;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export async function saveOnboardingDraft(
  patch: Partial<OnboardingDraft>,
): Promise<OnboardingDraft> {
  const current = await loadOnboardingDraft();
  const next = { ...current, ...patch };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function clearOnboardingDraft() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
