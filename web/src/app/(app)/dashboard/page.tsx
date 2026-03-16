'use client';

import { useApi } from '@/lib/hooks';

interface DashboardStats {
  total_tracks: number;
  tracks_with_stories: number;
  stories_verified: number;
  stories_draft: number;
  stories_distributed: number;
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-muted rounded-lg p-6 border border-border">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color || ''}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useApi<DashboardStats>('/v1/dashboard');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {loading && <p className="text-muted-foreground">Loading stats...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Tracks" value={data.total_tracks} />
          <StatCard label="Tracks with Stories" value={data.tracks_with_stories} />
          <StatCard label="Verified Stories" value={data.stories_verified} color="text-success" />
          <StatCard label="Draft Stories" value={data.stories_draft} color="text-warning" />
          <StatCard label="Distributed" value={data.stories_distributed} color="text-primary" />
        </div>
      )}
    </div>
  );
}
