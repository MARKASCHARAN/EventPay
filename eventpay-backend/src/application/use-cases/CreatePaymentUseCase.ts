import crypto from 'crypto';
import { PaymentRepository } from '../ports/PaymentRepository';
import { PaymentCreated } from '../../domain/payments/PaymentDomainEvent';

export interface CreatePaymentCommand {
  amount: number;
  currency: string;
}

export class CreatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: CreatePaymentCommand): Promise<string> {
    if (command.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const paymentId = crypto.randomUUID();

    const event: PaymentCreated = {
      type: 'PaymentCreated',
      paymentId,
      amount: command.amount,
      currency: command.currency,
      occurredAt: new Date(),
    };

    // For a new payment, expectedVersion is typically 0
    await this.paymentRepository.appendEvents(paymentId, [event], 0);

    return paymentId;
  }
}
