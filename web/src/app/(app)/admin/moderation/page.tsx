'use client';

import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useState } from 'react';

interface ModerationItem {
  story_id: string;
  artist_name: string;
  track_title: string;
  flag_reason: string;
  status: string;
  created_at: string;
}

interface ModerationResponse {
  data: ModerationItem[];
  pagination: { page: number; per_page: number; total: number };
}

export default function ModerationPage() {
  const { data, loading, error, refetch } = useApi<ModerationResponse>('/v1/admin/moderation?per_page=50');
  const { session } = useAuth();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleAction(storyId: string, action: 'approve' | 'reject') {
    if (!session) return;
    setActionLoading(`${storyId}-${action}`);
    try {
      await api(`/v1/admin/moderation/${storyId}/${action}`, {
        method: 'POST',
        token: session.access_token,
        body: action === 'reject' ? { reason: 'Content policy violation' } : undefined,
      });
      refetch();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Content Moderation</h1>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {data && data.data.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No items pending moderation.</p>
      )}

      <div className="space-y-3">
        {data?.data.map((item) => (
          <div key={item.story_id} className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.track_title}</p>
                <p className="text-sm text-muted-foreground">by {item.artist_name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Flag: {item.flag_reason} &middot; {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(item.story_id, 'approve')}
                  disabled={!!actionLoading}
                  className="px-3 py-1 text-xs bg-success text-white rounded hover:opacity-80 disabled:opacity-50"
                >
                  {actionLoading === `${item.story_id}-approve` ? '...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleAction(item.story_id, 'reject')}
                  disabled={!!actionLoading}
                  className="px-3 py-1 text-xs bg-destructive text-white rounded hover:opacity-80 disabled:opacity-50"
                >
                  {actionLoading === `${item.story_id}-reject` ? '...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
