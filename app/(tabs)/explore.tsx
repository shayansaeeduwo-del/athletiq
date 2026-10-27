import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { athletiq } from '@/constants/athletiq';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.center}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.accentLine} />
        <Text style={styles.placeholder}>Profile coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: athletiq.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    color: athletiq.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: athletiq.accent,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 20,
  },
  placeholder: {
    color: athletiq.textMuted,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
});
