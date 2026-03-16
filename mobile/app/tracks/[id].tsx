import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi } from '../../src/lib/hooks';
import { useAuth } from '../../src/lib/auth-context';
import { api } from '../../src/lib/api';
import { colors, spacing, fontSize } from '../../src/lib/theme';
import { useState } from 'react';

interface Story {
  id: string;
  source_type: string;
  status: string;
  duration_seconds: number;
  version: number;
  created_at: string;
}

interface TrackDetail {
  id: string;
  isrc: string;
  title: string;
  album: string | null;
  stories: Story[];
}

const statusColors: Record<string, string> = {
  draft: colors.warning,
  published: colors.primary,
  verified: colors.success,
  rejected: colors.destructive,
};

export default function TrackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: track, loading, refetch } = useApi<TrackDetail>(`/v1/tracks/${id}`);
  const { session } = useAuth();
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState('');

  async function storyAction(storyId: string, action: string) {
    if (!session) return;
    setActionLoading(`${storyId}-${action}`);
    try {
      await api(`/v1/stories/${storyId}/${action}`, { method: 'POST', token: session.access_token });
      refetch();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading('');
    }
  }

  async function deleteStory(storyId: string) {
    if (!session) return;
    Alert.alert('Delete Story', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await api(`/v1/stories/${storyId}`, { method: 'DELETE', token: session.access_token });
          refetch();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}>
      {track && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>{track.title}</Text>
            <Text style={styles.isrc}>{track.isrc}</Text>
            {track.album && <Text style={styles.album}>{track.album}</Text>}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.recordBtn}
              onPress={() => router.push({ pathname: '/record/recording', params: { trackId: track.id, trackTitle: track.title } })}
            >
              <Text style={styles.recordBtnText}>Record Story</Text>
            </TouchableOpacity>
          </View>

          {track.stories.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No stories yet. Record one!</Text>
            </View>
          )}

          {track.stories.map((story) => (
            <View key={story.id} style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <View style={[styles.badge, { backgroundColor: (statusColors[story.status] || colors.mutedForeground) + '20' }]}>
                  <Text style={[styles.badgeText, { color: statusColors[story.status] || colors.mutedForeground }]}>
                    {story.status}
                  </Text>
                </View>
                <Text style={styles.storyMeta}>
                  v{story.version} · {Math.round(story.duration_seconds)}s
                </Text>
              </View>

              <View style={styles.storyActions}>
                {story.status === 'draft' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => storyAction(story.id, 'publish')}
                    disabled={!!actionLoading}
                  >
                    <Text style={styles.actionBtnText}>Publish</Text>
                  </TouchableOpacity>
                )}
                {story.status === 'published' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.success }]}
                    onPress={() => storyAction(story.id, 'verify')}
                    disabled={!!actionLoading}
                  >
                    <Text style={styles.actionBtnText}>Verify</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.destructive }]}
                  onPress={() => deleteStory(story.id)}
                >
                  <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
      {loading && !track && <Text style={styles.loadingText}>Loading...</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground },
  isrc: { fontSize: fontSize.xs, color: colors.mutedForeground, fontFamily: 'monospace', marginTop: 4 },
  album: { fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 4 },
  actions: { padding: spacing.lg },
  recordBtn: { backgroundColor: colors.primary, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  recordBtnText: { color: '#ffffff', fontSize: fontSize.md, fontWeight: '600' },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.sm, color: colors.mutedForeground },
  storyCard: { margin: spacing.lg, marginTop: 0, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  storyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 6 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  storyMeta: { fontSize: fontSize.xs, color: colors.mutedForeground },
  storyActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 6 },
  actionBtnText: { fontSize: fontSize.xs, fontWeight: '600', color: '#ffffff' },
  loadingText: { textAlign: 'center', color: colors.mutedForeground, marginTop: spacing.xl },
});
