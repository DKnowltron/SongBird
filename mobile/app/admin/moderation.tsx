import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useApi } from '../../src/lib/hooks';
import { useAuth } from '../../src/lib/auth-context';
import { api } from '../../src/lib/api';
import { colors, spacing, fontSize } from '../../src/lib/theme';

interface ModerationItem {
  story_id: string;
  artist_name: string;
  track_title: string;
  flag_reason: string;
  created_at: string;
}

interface ModerationResponse {
  data: ModerationItem[];
  pagination: { page: number; per_page: number; total: number };
}

export default function ModerationScreen() {
  const { data, loading, refetch } = useApi<ModerationResponse>('/v1/admin/moderation?per_page=50');
  const { session } = useAuth();

  async function handleAction(storyId: string, action: 'approve' | 'reject') {
    if (!session) return;
    try {
      await api(`/v1/admin/moderation/${storyId}/${action}`, {
        method: 'POST',
        token: session.access_token,
        body: action === 'reject' ? { reason: 'Content policy violation' } : undefined,
      });
      refetch();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Action failed');
    }
  }

  return (
    <FlatList
      style={styles.container}
      data={data?.data || []}
      keyExtractor={(item) => item.story_id}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items pending moderation.</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.track_title}</Text>
          <Text style={styles.artist}>by {item.artist_name}</Text>
          <Text style={styles.flag}>Flag: {item.flag_reason}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]} onPress={() => handleAction(item.story_id, 'approve')}>
              <Text style={styles.btnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.destructive }]} onPress={() => handleAction(item.story_id, 'reject')}>
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: fontSize.md, fontWeight: '600', color: colors.foreground },
  artist: { fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 2 },
  flag: { fontSize: fontSize.xs, color: colors.mutedForeground, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 6 },
  btnText: { fontSize: fontSize.xs, fontWeight: '600', color: '#ffffff' },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.sm, color: colors.mutedForeground },
});
