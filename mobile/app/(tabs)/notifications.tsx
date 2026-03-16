import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useApi } from '../../src/lib/hooks';
import { useAuth } from '../../src/lib/auth-context';
import { api } from '../../src/lib/api';
import { colors, spacing, fontSize } from '../../src/lib/theme';
import { useState } from 'react';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  data: Notification[];
  unread_count: number;
}

export default function NotificationsScreen() {
  const { data, loading, refetch } = useApi<NotificationsResponse>('/v1/notifications?per_page=50');
  const { session } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  async function markRead(id: string) {
    if (!session) return;
    await api(`/v1/notifications/${id}/read`, { method: 'POST', token: session.access_token });
    refetch();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No notifications yet.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, item.read && styles.rowRead]}
            onPress={() => !item.read && markRead(item.id)}
            activeOpacity={item.read ? 1 : 0.7}
          >
            {!item.read && <View style={styles.dot} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        )}
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
    backgroundColor: colors.muted,
    gap: spacing.md,
  },
  rowRead: { backgroundColor: colors.background, opacity: 0.6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  message: { fontSize: fontSize.sm, color: colors.foreground },
  time: { fontSize: fontSize.xs, color: colors.mutedForeground, marginTop: 4 },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.sm, color: colors.mutedForeground },
});
