import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useApi } from '../../src/lib/hooks';
import { colors, spacing, fontSize } from '../../src/lib/theme';

interface Partner {
  id: string;
  name: string;
  status: string;
  webhook_url: string | null;
  created_at: string;
}

interface PartnersResponse {
  data: Partner[];
  pagination: { page: number; per_page: number; total: number };
}

const statusColors: Record<string, string> = {
  active: colors.success,
  inactive: colors.mutedForeground,
  onboarding: colors.warning,
};

export default function PartnersScreen() {
  const { data, loading } = useApi<PartnersResponse>('/v1/admin/partners?per_page=50');

  return (
    <FlatList
      style={styles.container}
      data={data?.data || []}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No partners yet. Manage partners from the web app.</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.webhook}>{item.webhook_url || 'No webhook'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: (statusColors[item.status] || colors.mutedForeground) + '20' }]}>
            <Text style={[styles.badgeText, { color: statusColors[item.status] || colors.mutedForeground }]}>
              {item.status}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  name: { fontSize: fontSize.md, fontWeight: '600', color: colors.foreground },
  webhook: { fontSize: fontSize.xs, color: colors.mutedForeground, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 6 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.sm, color: colors.mutedForeground, textAlign: 'center' },
});
