'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApi, useApiMutation } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

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

export default function TracksPage() {
  const { data, loading, error, refetch } = useApi<TracksResponse>('/v1/tracks?per_page=50');
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tracks</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowImport(true); setShowAdd(false); }}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          >
            Import CSV
          </button>
          <button
            onClick={() => { setShowAdd(true); setShowImport(false); }}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
          >
            Add Track
          </button>
        </div>
      </div>

      {showAdd && <AddTrackForm onDone={() => { setShowAdd(false); refetch(); }} />}
      {showImport && <ImportCSVForm onDone={() => { setShowImport(false); refetch(); }} />}

      {loading && <p className="text-muted-foreground">Loading tracks...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {data && data.data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No tracks yet</p>
          <p className="mt-1">Add a track or import your catalog to get started.</p>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">ISRC</th>
                <th className="text-left px-4 py-3 font-medium">Album</th>
                <th className="text-left px-4 py-3 font-medium">Stories</th>
                <th className="text-left px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((track) => (
                <tr key={track.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{track.title}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{track.isrc}</td>
                  <td className="px-4 py-3 text-muted-foreground">{track.album || '—'}</td>
                  <td className="px-4 py-3">
                    {track.has_verified_story && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-success/10 text-success">
                        Verified
                      </span>
                    )}
                    {!track.has_verified_story && (track.story_count || 0) > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-warning/10 text-warning">
                        Draft
                      </span>
                    )}
                    {(track.story_count || 0) === 0 && (
                      <span className="text-muted-foreground text-xs">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/tracks/${track.id}`}
                      className="text-primary text-sm hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddTrackForm({ onDone }: { onDone: () => void }) {
  const [isrc, setIsrc] = useState('');
  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState('');
  const { mutate, loading, error } = useApiMutation<{ isrc: string; title: string; album?: string }>('/v1/tracks');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await mutate({ isrc, title, album: album || undefined });
    if (result) onDone();
  }

  return (
    <div className="mb-6 p-4 border border-border rounded-lg bg-muted">
      <h2 className="text-sm font-medium mb-3">Add a track</h2>
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1">ISRC</label>
          <input
            value={isrc}
            onChange={(e) => setIsrc(e.target.value)}
            required
            placeholder="USUM12345678"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Song Title"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1">Album (optional)</label>
          <input
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="Album Name"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover text-sm disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </form>
      {error && <p className="text-destructive text-sm mt-2">{error}</p>}
    </div>
  );
}

function ImportCSVForm({ onDone }: { onDone: () => void }) {
  const { session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: { row: number; reason: string }[] } | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !session) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api<{ imported: number; skipped: number; errors: { row: number; reason: string }[] }>(
        '/v1/tracks/import',
        { method: 'POST', body: formData, token: session.access_token },
      );
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 p-4 border border-border rounded-lg bg-muted">
      <h2 className="text-sm font-medium mb-3">Import tracks from CSV</h2>
      <p className="text-xs text-muted-foreground mb-3">CSV should have columns: isrc, title, album (optional)</p>

      {result ? (
        <div className="space-y-2">
          <p className="text-sm text-success">Imported {result.imported} tracks, skipped {result.skipped}.</p>
          {result.errors.length > 0 && (
            <div className="text-sm text-destructive">
              {result.errors.map((e, i) => (
                <p key={i}>Row {e.row}: {e.reason}</p>
              ))}
            </div>
          )}
          <button onClick={onDone} className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-hover">
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !file}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover text-sm disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
          <button type="button" onClick={onDone} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </form>
      )}
      {error && <p className="text-destructive text-sm mt-2">{error}</p>}
    </div>
  );
}
