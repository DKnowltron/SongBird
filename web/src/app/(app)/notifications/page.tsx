'use client';

import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
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

export default function NotificationsPage() {
  const { data, loading, error, refetch } = useApi<NotificationsResponse>('/v1/notifications?per_page=50');
  const { session } = useAuth();
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  async function markAsRead(id: string) {
    if (!session) return;
    setMarkingRead(id);
    try {
      await api(`/v1/notifications/${id}/read`, { method: 'POST', token: session.access_token });
      refetch();
    } catch {
      // ignore
    } finally {
      setMarkingRead(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {data && data.unread_count > 0 && (
          <span className="text-sm text-muted-foreground">{data.unread_count} unread</span>
        )}
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {data && data.data.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No notifications yet.</p>
      )}

      <div className="space-y-2">
        {data?.data.map((n) => (
          <div
            key={n.id}
            className={`p-4 border border-border rounded-lg flex items-center justify-between ${
              n.read ? 'opacity-60' : 'bg-muted'
            }`}
          >
            <div>
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            {!n.read && (
              <button
                onClick={() => markAsRead(n.id)}
                disabled={markingRead === n.id}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
