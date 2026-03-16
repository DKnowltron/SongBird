'use client';

import { useApi } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useState } from 'react';

interface Partner {
  id: string;
  name: string;
  status: string;
  webhook_url: string | null;
  created_at: string;
}

interface PartnersResponse {
  data: Partner[];
  pagination: { page: number; per_page: number; total: number };
}

export default function PartnersPage() {
  const { data, loading, error, refetch } = useApi<PartnersResponse>('/v1/admin/partners?per_page=50');
  const [showAdd, setShowAdd] = useState(false);

  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success',
    inactive: 'bg-muted text-muted-foreground',
    onboarding: 'bg-warning/10 text-warning',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Partners</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-hover"
        >
          Add Partner
        </button>
      </div>

      {showAdd && <AddPartnerForm onDone={() => { setShowAdd(false); refetch(); }} />}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {data && data.data.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No partners yet.</p>
      )}

      <div className="space-y-3">
        {data?.data.map((partner) => (
          <div key={partner.id} className="p-4 border border-border rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{partner.name}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${statusColors[partner.status] || ''}`}>
                  {partner.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Webhook: {partner.webhook_url || 'Not configured'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(partner.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddPartnerForm({ onDone }: { onDone: () => void }) {
  const { session } = useAuth();
  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setLoading(true);
    setError('');

    try {
      const result = await api<{ id: string; api_key: string }>('/v1/admin/partners', {
        method: 'POST',
        body: { name, webhook_url: webhookUrl || undefined },
        token: session.access_token,
      });
      setApiKey(result.api_key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create partner');
    } finally {
      setLoading(false);
    }
  }

  if (apiKey) {
    return (
      <div className="mb-6 p-4 border border-border rounded-lg bg-muted">
        <h3 className="text-sm font-medium mb-2">Partner created!</h3>
        <p className="text-xs text-muted-foreground mb-2">Copy this API key — it won&apos;t be shown again:</p>
        <code className="block p-3 bg-background border border-border rounded text-xs font-mono break-all">
          {apiKey}
        </code>
        <button onClick={onDone} className="mt-3 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-hover">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 border border-border rounded-lg bg-muted">
      <h3 className="text-sm font-medium mb-3">Add a streaming platform partner</h3>
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1">Partner name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Spotify"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1">Webhook URL (optional)</label>
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover text-sm disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </form>
      {error && <p className="text-destructive text-sm mt-2">{error}</p>}
    </div>
  );
}
