import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection.js';
import { generateWebhookSignature } from '../../utils/crypto.js';
import { getLogger } from '../../utils/logger.js';
import type { WebhookEvent, WebhookPayload } from './webhooks.schemas.js';

// --- Audit logging helper ---

interface AuditInput {
  eventType: string;
  actorId: string;
  actorType: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
}

export async function logAuditEvent(input: AuditInput): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_events (id, event_type, actor_id, actor_type, resource_type, resource_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        uuidv4(),
        input.eventType,
        input.actorId,
        input.actorType,
        input.resourceType,
        input.resourceId,
        JSON.stringify(input.details),
      ],
    );
  } catch (err) {
    // Audit logging should never break the main flow
    const logger = getLogger();
    logger.error({ err, audit: input }, 'Failed to log audit event');
  }
}

// --- Webhook dispatch ---

// Simple in-memory queue — replaceable with Redis/SQS later
interface QueuedWebhook {
  id: string;
  partnerId: string;
  webhookUrl: string;
  payload: WebhookPayload;
  attempts: number;
}

const webhookQueue: QueuedWebhook[] = [];
let processingInterval: ReturnType<typeof setInterval> | null = null;

export async function dispatchWebhook(event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
  const logger = getLogger();

  // Find all active partners with webhook URLs
  const result = await query<{ id: string; webhook_url: string }>(
    `SELECT id, webhook_url FROM partners WHERE status = 'active' AND webhook_url IS NOT NULL`,
  );

  if (result.rows.length === 0) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  for (const partner of result.rows) {
    webhookQueue.push({
      id: uuidv4(),
      partnerId: partner.id,
      webhookUrl: partner.webhook_url,
      payload,
      attempts: 0,
    });
  }

  logger.debug({ event, queueLength: webhookQueue.length }, 'Webhooks queued');

  // Ensure the processor is running
  startWebhookProcessor();
}

function startWebhookProcessor() {
  if (processingInterval) return;

  processingInterval = setInterval(async () => {
    if (webhookQueue.length === 0) return;

    const logger = getLogger();
    const webhook = webhookQueue.shift();
    if (!webhook) return;

    try {
      const body = JSON.stringify(webhook.payload);
      const signature = generateWebhookSignature(body, 'webhook-secret'); // TODO: per-partner secrets

      const response = await fetch(webhook.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Storyteller-Signature': signature,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      logger.info(
        { webhookId: webhook.id, partnerId: webhook.partnerId, event: webhook.payload.event },
        'Webhook delivered',
      );
    } catch (err) {
      webhook.attempts++;
      if (webhook.attempts < 3) {
        webhookQueue.push(webhook); // Retry
        logger.warn(
          { webhookId: webhook.id, attempt: webhook.attempts, err },
          'Webhook delivery failed, retrying',
        );
      } else {
        logger.error(
          { webhookId: webhook.id, partnerId: webhook.partnerId, err },
          'Webhook delivery failed permanently',
        );
      }
    }
  }, 1000);
}

export function stopWebhookProcessor() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
  }
}
