import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../src/lib/auth-context';
import { api } from '../../src/lib/api';
import { colors, spacing, fontSize } from '../../src/lib/theme';

type RecordingState = 'idle' | 'recording' | 'recorded' | 'uploading';

export default function RecordingScreen() {
  const { trackId, trackTitle } = useLocalSearchParams<{ trackId: string; trackTitle: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const uriRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      soundRef.current?.unloadAsync();
    };
  }, []);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone access is needed to record stories.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      setState('recording');
      setDuration(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      setError('Failed to start recording');
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    await recordingRef.current.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

    uriRef.current = recordingRef.current.getURI();
    recordingRef.current = null;
    setState('recorded');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function playback() {
    if (!uriRef.current) return;
    const { sound } = await Audio.Sound.createAsync({ uri: uriRef.current });
    soundRef.current = sound;
    await sound.playAsync();
  }

  function discard() {
    uriRef.current = null;
    setDuration(0);
    setState('idle');
  }

  async function upload() {
    if (!uriRef.current || !session || !trackId) return;

    setState('uploading');
    setError('');

    const formData = new FormData();
    formData.append('audio', {
      uri: uriRef.current,
      name: `story-${Date.now()}.m4a`,
      type: 'audio/mp4',
    } as unknown as Blob);
    if (transcript) formData.append('transcript', transcript);

    try {
      await api(`/v1/tracks/${trackId}/stories`, {
        method: 'POST',
        body: formData,
        token: session.access_token,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved!', 'Your story has been saved as a draft.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setState('recorded');
    }
  }

  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.trackName}>{trackTitle}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.center}>
        <Text style={styles.timer}>{formatTime(duration)}</Text>

        {state === 'recording' && <View style={styles.pulse} />}
      </View>

      {state === 'idle' && (
        <TouchableOpacity style={styles.recordBtn} onPress={startRecording} activeOpacity={0.8}>
          <View style={styles.recordCircle}>
            <Text style={styles.recordDot}>●</Text>
          </View>
          <Text style={styles.recordLabel}>Tap to Record</Text>
        </TouchableOpacity>
      )}

      {state === 'recording' && (
        <TouchableOpacity style={styles.recordBtn} onPress={stopRecording} activeOpacity={0.8}>
          <View style={[styles.recordCircle, { backgroundColor: colors.foreground }]}>
            <Text style={[styles.recordDot, { fontSize: 24 }]}>■</Text>
          </View>
          <Text style={styles.recordLabel}>Tap to Stop</Text>
        </TouchableOpacity>
      )}

      {(state === 'recorded' || state === 'uploading') && (
        <View style={styles.reviewSection}>
          <TouchableOpacity style={styles.playBtn} onPress={playback}>
            <Text style={styles.playBtnText}>▶ Play Back</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.transcriptInput}
            placeholder="Add a transcript (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={transcript}
            onChangeText={setTranscript}
            multiline
          />

          <TouchableOpacity
            style={[styles.saveBtn, state === 'uploading' && { opacity: 0.5 }]}
            onPress={upload}
            disabled={state === 'uploading'}
          >
            <Text style={styles.saveBtnText}>{state === 'uploading' ? 'Saving...' : 'Save Story'}</Text>
          </TouchableOpacity>

          <View style={styles.reviewActions}>
            <TouchableOpacity onPress={discard} disabled={state === 'uploading'}>
              <Text style={styles.secondaryAction}>Re-record</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} disabled={state === 'uploading'}>
              <Text style={styles.secondaryAction}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  trackName: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foreground, textAlign: 'center', marginTop: spacing.md },
  error: { color: colors.destructive, textAlign: 'center', marginTop: spacing.md, fontSize: fontSize.sm },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timer: { fontSize: 64, fontWeight: '200', color: colors.foreground, fontVariant: ['tabular-nums'] },
  pulse: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: colors.destructive,
    marginTop: spacing.md, opacity: 0.8,
  },
  recordBtn: { alignItems: 'center', paddingBottom: spacing.xl * 2 },
  recordCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.destructive,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.destructive, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  recordDot: { fontSize: 36, color: '#ffffff' },
  recordLabel: { fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: spacing.md },
  reviewSection: { paddingBottom: spacing.xl },
  playBtn: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: spacing.md, alignItems: 'center', marginBottom: spacing.md,
  },
  playBtnText: { fontSize: fontSize.md, color: colors.foreground, fontWeight: '600' },
  transcriptInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: spacing.md, fontSize: fontSize.md, color: colors.foreground,
    minHeight: 80, textAlignVertical: 'top', marginBottom: spacing.md,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 8,
    padding: spacing.md, alignItems: 'center',
  },
  saveBtnText: { color: '#ffffff', fontSize: fontSize.md, fontWeight: '600' },
  reviewActions: {
    flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.lg,
  },
  secondaryAction: { fontSize: fontSize.sm, color: colors.mutedForeground },
});
