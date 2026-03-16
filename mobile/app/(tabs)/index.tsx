import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useApi } from '../../src/lib/hooks';
import { colors, spacing, fontSize } from '../../src/lib/theme';
import { useState } from 'react';

interface DashboardStats {
  total_tracks: number;
  tracks_with_stories: number;
  stories_verified: number;
  stories_draft: number;
  stories_distributed: number;
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, color ? { color } : undefined]}>{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { data, loading, refetch } = useApi<DashboardStats>('/v1/dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Dashboard</Text>

      {data && (
        <View style={styles.grid}>
          <StatCard label="Total Tracks" value={data.total_tracks} />
          <StatCard label="With Stories" value={data.tracks_with_stories} />
          <StatCard label="Verified" value={data.stories_verified} color={colors.success} />
          <StatCard label="Drafts" value={data.stories_draft} color={colors.warning} />
          <StatCard label="Distributed" value={data.stories_distributed} color={colors.primary} />
        </View>
      )}

      {loading && !data && <Text style={styles.loading}>Loading...</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: '47%',
    flexGrow: 1,
  },
  cardLabel: { fontSize: fontSize.sm, color: colors.mutedForeground },
  cardValue: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.foreground, marginTop: spacing.xs },
  loading: { color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.xl },
});
