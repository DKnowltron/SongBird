import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../../src/lib/hooks';
import { colors, spacing, fontSize } from '../../src/lib/theme';
import { useState } from 'react';

interface Track {
  id: string;
  isrc: string;
  title: string;
  album: string | null;
}

interface TracksResponse {
  data: Track[];
  pagination: { page: number; per_page: number; total: number };
}

export default function SelectTrackScreen() {
  const { data } = useApi<TracksResponse>('/v1/tracks?per_page=100');
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filtered = (data?.data || []).filter(
    (t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.isrc.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search tracks..."
        placeholderTextColor={colors.mutedForeground}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tracks found. Add tracks from the web app.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push({ pathname: '/record/recording', params: { trackId: item.id, trackTitle: item.title } })}
          >
            <Text style={styles.trackTitle}>{item.title}</Text>
            <Text style={styles.trackIsrc}>{item.isrc}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: {
    margin: spacing.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    fontSize: fontSize.md, color: colors.foreground,
  },
  row: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  trackTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.foreground },
  trackIsrc: { fontSize: fontSize.xs, color: colors.mutedForeground, fontFamily: 'monospace', marginTop: 2 },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.sm, color: colors.mutedForeground, textAlign: 'center' },
});
