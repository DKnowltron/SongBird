// --- Enums ---

export type SourceType = 'artist_recording' | 'ai_generated' | 'archival_compilation';
export type StoryStatus = 'draft' | 'published' | 'verified' | 'rejected';
export type PartnerStatus = 'active' | 'inactive' | 'onboarding';
export type DistributionStatus = 'pending' | 'delivered' | 'acknowledged' | 'failed';
export type ActorType = 'artist' | 'label_manager' | 'system' | 'partner';
export type AudioFormat = 'mp3' | 'wav' | 'aac';

// --- Entities ---

export interface Label {
  id: string;
  name: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  label_id: string | null;
  avatar_url: string | null;
  verified_identity: boolean;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  isrc: string;
  title: string;
  artist_id: string;
  album: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  track_id: string;
  artist_id: string;
  source_type: SourceType;
  status: StoryStatus;
  priority: number;
  audio_asset_id: string;
  transcript: string | null;
  duration_seconds: number;
  version: number;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AudioAsset {
  id: string;
  storage_key: string;
  format: string;
  size_bytes: number;
  duration_seconds: number;
  sample_rate: number;
  uploaded_by: string;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  api_key_hash: string;
  webhook_url: string | null;
  status: PartnerStatus;
  created_at: string;
  updated_at: string;
}

export interface Distribution {
  id: string;
  story_id: string;
  partner_id: string;
  status: DistributionStatus;
  delivered_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  event_type: string;
  actor_id: string;
  actor_type: ActorType;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  artist_id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

// --- Pagination ---

export interface PaginationParams {
  page: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
  };
}

// --- Auth ---

export interface JwtPayload {
  artistId: string;
  email: string;
  role?: string;
}

// --- Fastify augmentation ---

declare module 'fastify' {
  interface FastifyRequest {
    artistId?: string;
    artistEmail?: string;
    artistRole?: string;
    partnerId?: string;
  }
}
