import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/lib/auth-context';
import { colors, spacing, fontSize } from '../../src/lib/theme';

export default function ProfileScreen() {
  const { artist, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{artist?.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{artist?.name || 'Artist'}</Text>
        <Text style={styles.email}>{artist?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/moderation')}>
          <Text style={styles.menuText}>Moderation Queue</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/partners')}>
          <Text style={styles.menuText}>Partner Management</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.xl, fontWeight: '700', color: '#ffffff' },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.foreground, marginTop: spacing.md },
  email: { fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: spacing.xs },
  section: { marginTop: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.xs, fontWeight: '600', color: colors.mutedForeground,
    textTransform: 'uppercase', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuText: { fontSize: fontSize.md, color: colors.foreground },
  menuArrow: { fontSize: fontSize.lg, color: colors.mutedForeground },
  signOut: {
    margin: spacing.lg, padding: spacing.md, borderRadius: 8,
    borderWidth: 1, borderColor: colors.destructive, alignItems: 'center',
  },
  signOutText: { fontSize: fontSize.md, color: colors.destructive, fontWeight: '600' },
});
