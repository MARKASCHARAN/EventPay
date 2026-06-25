import { Pool } from 'pg';
import axios from 'axios';

export class WebhookWorker {
  private isRunning = false;
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    private readonly pool: Pool,
    private readonly merchantEndpoint: string,
    private readonly pollIntervalMs: number = 5000
  ) {}

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[WebhookWorker] Started. Polling every ${this.pollIntervalMs}ms`);
    this.poll();
  }

  stop() {
    this.isRunning = false;
    console.log('[WebhookWorker] Stopped.');
  }

  private async poll() {
    if (!this.isRunning) return;

    try {
      await this.processOutbox();
    } catch (error) {
      console.error('[WebhookWorker] Polling error:', error);
    } finally {
      if (this.isRunning) {
        setTimeout(() => this.poll(), this.pollIntervalMs);
      }
    }
  }

  private async processOutbox() {
    const client = await this.pool.connect();
    try {
      // Find one PENDING message that is ready to be sent
      // Using FOR UPDATE SKIP LOCKED ensures we don't process the same message in multiple workers
      const selectQuery = `
        SELECT id, payment_id, event_type, payload, attempts
        FROM webhook_outbox
        WHERE status = 'PENDING' AND next_attempt_at <= NOW()
        ORDER BY created_at ASC
        LIMIT 10
        FOR UPDATE SKIP LOCKED
      `;
      
      const { rows } = await client.query(selectQuery);
      
      if (rows.length === 0) {
        return; // Nothing to process
      }

      console.log(`[WebhookWorker] Picked up ${rows.length} events for delivery`);

      for (const row of rows) {
        await this.deliverWebhook(client, row);
      }

    } finally {
      client.release();
    }
  }

  private async deliverWebhook(client: any, row: any) {
    const { id, payment_id, event_type, payload, attempts } = row;

    try {
      console.log(`[WebhookWorker] Delivering event ${event_type} for payment ${payment_id}`);
      
      // Attempt Delivery
      await axios.post(this.merchantEndpoint, {
        paymentId: payment_id,
        type: event_type,
        data: payload,
      }, { timeout: 3000 }); // 3 seconds timeout

      // Success
      await client.query(
        `UPDATE webhook_outbox SET status = 'SUCCESS' WHERE id = $1`,
        [id]
      );
      console.log(`[WebhookWorker] Successfully delivered event ${event_type}`);

    } catch (error: any) {
      const newAttempts = attempts + 1;
      console.error(`[WebhookWorker] Failed to deliver event. Attempt ${newAttempts}/${this.MAX_ATTEMPTS}`);

      if (newAttempts >= this.MAX_ATTEMPTS) {
        // Dead Letter Queue
        await client.query(
          `UPDATE webhook_outbox SET status = 'FAILED', attempts = $1 WHERE id = $2`,
          [newAttempts, id]
        );
        console.error(`[WebhookWorker] Event ${id} permanently failed (DLQ).`);
      } else {
        // Exponential backoff
        // attempt 1 -> 5s, attempt 2 -> 25s, attempt 3 -> 125s, etc.
        const backoffSeconds = Math.pow(5, newAttempts); 
        await client.query(
          `UPDATE webhook_outbox 
           SET attempts = $1, next_attempt_at = NOW() + INTERVAL '${backoffSeconds} seconds' 
           WHERE id = $2`,
          [newAttempts, id]
        );
      }
    }
  }
}
