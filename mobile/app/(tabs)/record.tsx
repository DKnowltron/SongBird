import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize } from '../../src/lib/theme';

export default function RecordTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record a Story</Text>
      <Text style={styles.subtitle}>Tell the story behind your song</Text>

      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => router.push('/record/select-track')}
        activeOpacity={0.8}
      >
        <View style={styles.recordCircle}>
          <Text style={styles.recordIcon}>●</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.hint}>Tap to select a track and start recording</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground },
  subtitle: { fontSize: fontSize.md, color: colors.mutedForeground, marginTop: spacing.sm },
  recordButton: { marginTop: spacing.xl * 2, marginBottom: spacing.xl },
  recordCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.destructive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  recordIcon: { fontSize: 48, color: '#ffffff' },
  hint: { fontSize: fontSize.sm, color: colors.mutedForeground },
});
