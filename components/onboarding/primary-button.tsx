import { Pressable, StyleSheet, Text } from 'react-native';

import { athletiq } from '@/constants/athletiq';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
};

export function PrimaryButton({ label, onPress, variant = 'primary' }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        isPrimary ? styles.primary : styles.ghost,
        pressed && { opacity: 0.85 },
      ]}>
      <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelGhost]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: athletiq.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: athletiq.border,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
  labelPrimary: {
    color: athletiq.background,
  },
  labelGhost: {
    color: athletiq.text,
  },
});
