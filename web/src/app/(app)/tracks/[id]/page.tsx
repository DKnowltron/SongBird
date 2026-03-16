'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { StoryRecorder } from '@/components/story-recorder';

interface Story {
  id: string;
  source_type: string;
  status: string;
  duration_seconds: number;
  version: number;
  audio_url?: string;
  transcript?: string;
  created_at: string;
  verified_at?: string;
}

interface TrackDetail {
  id: string;
  isrc: string;
  title: string;
  album: string | null;
  stories: Story[];
}

export default function TrackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: track, loading, error, refetch } = useApi<TrackDetail>(`/v1/tracks/${id}`);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div>
      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {track && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{track.title}</h1>
            <p className="text-muted-foreground mt-1">
              <span className="font-mono text-xs">{track.isrc}</span>
              {track.album && <span> &middot; {track.album}</span>}
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Stories</h2>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowRecorder(true); setShowUpload(false); }}
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-hover"
              >
                Record Story
              </button>
              <button
                onClick={() => { setShowUpload(true); setShowRecorder(false); }}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
              >
                Upload Audio
              </button>
            </div>
          </div>

          {showRecorder && (
            <StoryRecorder
              trackId={track.id}
              onDone={() => { setShowRecorder(false); refetch(); }}
              onCancel={() => setShowRecorder(false)}
            />
          )}

          {showUpload && (
            <UploadStoryForm
              trackId={track.id}
              onDone={() => { setShowUpload(false); refetch(); }}
              onCancel={() => setShowUpload(false)}
            />
          )}

          {track.stories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-border rounded-lg">
              <p className="text-lg">No stories yet</p>
              <p className="mt-1">Record or upload a story for this track.</p>
            </div>
          )}

          <div className="space-y-3">
            {track.stories.map((story) => (
              <StoryCard key={story.id} story={story} onAction={refetch} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StoryCard({ story, onAction }: { story: Story; onAction: () => void }) {
  const { session } = useAuth();
  const [actionLoading, setActionLoading] = useState('');

  const statusColors: Record<string, string> = {
    draft: 'bg-warning/10 text-warning',
    published: 'bg-primary/10 text-primary',
    verified: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
  };

  async function handleAction(action: string) {
    if (!session) return;
    setActionLoading(action);
    try {
      await api(`/v1/stories/${story.id}/${action}`, {
        method: 'POST',
        token: session.access_token,
      });
      onAction();
    } catch {
      // Error handling — could show toast
    } finally {
      setActionLoading('');
    }
  }

  async function handleDelete() {
    if (!session || !confirm('Delete this story?')) return;
    setActionLoading('delete');
    try {
      await api(`/v1/stories/${story.id}`, {
        method: 'DELETE',
        token: session.access_token,
      });
      onAction();
    } catch {
      // Error handling
    } finally {
      setActionLoading('');
    }
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[story.status] || ''}`}>
            {story.status}
          </span>
          <span className="text-sm text-muted-foreground">
            v{story.version} &middot; {Math.round(story.duration_seconds)}s &middot; {story.source_type.replace('_', ' ')}
          </span>
        </div>
        <div className="flex gap-2">
          {story.status === 'draft' && (
            <button
              onClick={() => handleAction('publish')}
              disabled={!!actionLoading}
              className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50"
            >
              {actionLoading === 'publish' ? '...' : 'Publish'}
            </button>
          )}
          {story.status === 'published' && (
            <button
              onClick={() => handleAction('verify')}
              disabled={!!actionLoading}
              className="px-3 py-1 text-xs bg-success text-white rounded hover:opacity-80 disabled:opacity-50"
            >
              {actionLoading === 'verify' ? '...' : 'Verify'}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={!!actionLoading}
            className="px-3 py-1 text-xs text-destructive border border-destructive/30 rounded hover:bg-destructive/10 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {story.audio_url && (
        <audio controls className="mt-3 w-full h-8" src={story.audio_url}>
          <track kind="captions" />
        </audio>
      )}

      {story.transcript && (
        <p className="mt-2 text-sm text-muted-foreground italic">&quot;{story.transcript}&quot;</p>
      )}
    </div>
  );
}

function UploadStoryForm({ trackId, onDone, onCancel }: { trackId: string; onDone: () => void; onCancel: () => void }) {
  const { session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !session) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('audio', file);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 p-4 border border-border rounded-lg bg-muted">
      <h3 className="text-sm font-medium mb-3">Upload story audio</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Audio file (MP3, WAV, AAC — max 10MB, max 5 min)</label>
          <input
            type="file"
            accept="audio/mpeg,audio/wav,audio/aac,audio/mp4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Transcript (optional)</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            placeholder="The story behind this song..."
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !file}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover text-sm disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </form>
    </div>
  );
}
