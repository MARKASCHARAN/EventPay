import { Pool } from 'pg';
import { PaymentRepository } from '../../application/ports/PaymentRepository';
import { PaymentDomainEvent } from '../../domain/payments/PaymentDomainEvent';

export class PostgresPaymentRepository implements PaymentRepository {
  constructor(private readonly pool: Pool) {}

  async appendEvents(paymentId: string, events: PaymentDomainEvent[], expectedVersion: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // We start appending from expectedVersion + 1
      let currentVersion = expectedVersion;

      for (const event of events) {
        currentVersion++;
        
        // Extract base fields to store the rest cleanly in the JSONB column
        // We cast event as any here just for destructuring
        const { type, paymentId: _pid, occurredAt: _occAt, ...eventData } = event as any;

        const query = `
          INSERT INTO payment_events (payment_id, version, event_type, event_data, occurred_at)
          VALUES ($1, $2, $3, $4, $5)
        `;
        const values = [
          paymentId,
          currentVersion,
          type,
          eventData,
          event.occurredAt
        ];

        try {
          await client.query(query, values);
          
          // Also insert into the outbox for the webhook worker
          const outboxQuery = `
            INSERT INTO webhook_outbox (payment_id, event_type, payload)
            VALUES ($1, $2, $3)
          `;
          await client.query(outboxQuery, [paymentId, type, { ...eventData, occurredAt: event.occurredAt }]);
        } catch (error: any) {
          // 23505 is PostgreSQL's unique constraint violation code
          if (error.code === '23505') {
            throw new Error(`Optimistic concurrency control failed for payment ${paymentId} at version ${currentVersion}. Another process modified this payment.`);
          }
          throw error;
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getEvents(paymentId: string): Promise<PaymentDomainEvent[]> {
    const query = `
      SELECT event_type, event_data, occurred_at
      FROM payment_events
      WHERE payment_id = $1
      ORDER BY version ASC
    `;
    const { rows } = await this.pool.query(query, [paymentId]);

    // Map the database rows back to our rich domain event types
    return rows.map((row) => {
      const event: any = {
        type: row.event_type,
        paymentId: paymentId,
        occurredAt: new Date(row.occurred_at),
        ...row.event_data
      };
      return event as PaymentDomainEvent;
    });
  }
}
