export type WebhookEvent = 'story.published' | 'story.updated' | 'story.verified' | 'story.removed';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}
