import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../../src/lib/hooks';
import { colors, spacing, fontSize } from '../../src/lib/theme';
import { useState } from 'react';

interface Track {
  id: string;
  isrc: string;
  title: string;
  album: string | null;
  story_count?: number;
  has_verified_story?: boolean;
}

interface TracksResponse {
  data: Track[];
  pagination: { page: number; per_page: number; total: number };
}

export default function TracksScreen() {
  const { data, loading, refetch } = useApi<TracksResponse>('/v1/tracks?per_page=100');
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  const statusBadge = (track: Track) => {
    if (track.has_verified_story) return { text: 'Verified', color: colors.success };
    if ((track.story_count || 0) > 0) return { text: 'Draft', color: colors.warning };
    return { text: 'No story', color: colors.mutedForeground };
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No tracks yet</Text>
              <Text style={styles.emptyText}>Add tracks from the web app to get started.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const badge = statusBadge(item);
          return (
            <TouchableOpacity style={styles.row} onPress={() => router.push(`/tracks/${item.id}`)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.trackIsrc}>{item.isrc}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: badge.color + '20' }]}>
                <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trackTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.foreground },
  trackIsrc: { fontSize: fontSize.xs, color: colors.mutedForeground, fontFamily: 'monospace', marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 6 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foreground },
  emptyText: { fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: spacing.sm },
});
