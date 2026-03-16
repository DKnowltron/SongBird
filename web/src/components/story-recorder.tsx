'use client';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface StoryRecorderProps {
  trackId: string;
  onDone: () => void;
  onCancel: () => void;
}

export function StoryRecorder({ trackId, onDone, onCancel }: StoryRecorderProps) {
  const { session } = useAuth();
  const [state, setState] = useState<'idle' | 'recording' | 'recorded' | 'uploading'>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const blobRef = useRef<Blob | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobRef.current = blob;
        audioUrlRef.current = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        setState('recorded');
      };

      mediaRecorder.start(1000);
      setState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      setError('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const discard = useCallback(() => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    blobRef.current = null;
    setDuration(0);
    setState('idle');
  }, []);

  const upload = useCallback(async () => {
    if (!blobRef.current || !session) return;

    setState('uploading');
    setError('');

    const formData = new FormData();
    formData.append('audio', blobRef.current, `story-${Date.now()}.webm`);
    if (transcript) formData.append('transcript', transcript);

    try {
      await api(`/v1/tracks/${trackId}/stories`, {
        method: 'POST',
        body: formData,
        token: session.access_token,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setState('recorded');
    }
  }, [trackId, transcript, session, onDone]);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className="mb-6 p-4 border border-border rounded-lg bg-muted">
      <h3 className="text-sm font-medium mb-3">Record a story</h3>

      {error && <p className="text-destructive text-sm mb-3">{error}</p>}

      {state === 'idle' && (
        <div className="flex gap-2">
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-destructive text-white rounded-md hover:opacity-80 text-sm flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Start Recording
          </button>
          <button onClick={onCancel} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      )}

      {state === 'recording' && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="font-mono text-lg">{formatTime(duration)}</span>
            {duration >= 300 && <span className="text-warning text-sm">Max 5 minutes</span>}
          </div>
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-80 text-sm"
          >
            Stop Recording
          </button>
        </div>
      )}

      {(state === 'recorded' || state === 'uploading') && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Recorded: {formatTime(duration)}</span>
          </div>

          {audioUrlRef.current && (
            <audio controls className="w-full h-8" src={audioUrlRef.current}>
              <track kind="captions" />
            </audio>
          )}

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Transcript (optional)</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={3}
              placeholder="What you said in this recording..."
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={upload}
              disabled={state === 'uploading'}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover text-sm disabled:opacity-50"
            >
              {state === 'uploading' ? 'Uploading...' : 'Save Story'}
            </button>
            <button
              onClick={discard}
              disabled={state === 'uploading'}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Re-record
            </button>
            <button
              onClick={onCancel}
              disabled={state === 'uploading'}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
