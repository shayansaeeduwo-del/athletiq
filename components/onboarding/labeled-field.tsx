import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { athletiq } from '@/constants/athletiq';

type Props = {
  label: string;
  hint?: string;
} & TextInputProps;

export function LabeledField({ label, hint, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={athletiq.textSubtle}
        style={[styles.input, style]}
        {...rest}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  label: {
    color: athletiq.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: athletiq.inputBg,
    borderWidth: 1,
    borderColor: athletiq.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: athletiq.text,
    fontSize: 16,
  },
  hint: {
    color: athletiq.textSubtle,
    fontSize: 12,
    marginTop: 6,
  },
});
