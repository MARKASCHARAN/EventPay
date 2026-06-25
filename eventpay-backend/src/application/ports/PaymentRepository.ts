import { PaymentDomainEvent } from '../../domain/payments/PaymentDomainEvent';

export interface PaymentRepository {
  appendEvents(paymentId: string, events: PaymentDomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(paymentId: string): Promise<PaymentDomainEvent[]>;
}
