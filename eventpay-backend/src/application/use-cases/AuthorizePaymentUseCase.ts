import { PaymentRepository } from '../ports/PaymentRepository';
import { PaymentAuthorized, PaymentDomainEvent } from '../../domain/payments/PaymentDomainEvent';
import { applyPaymentEvent } from '../../domain/payments/applyPaymentEvent';
import { PaymentState } from '../../domain/payments/PaymentState';

export interface AuthorizePaymentCommand {
  paymentId: string;
}

export class AuthorizePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: AuthorizePaymentCommand): Promise<void> {
    const events = await this.paymentRepository.getEvents(command.paymentId);
    
    if (!events || events.length === 0) {
      throw new Error(`Payment with id ${command.paymentId} not found`);
    }

    // Rehydrate state
    let currentState: PaymentState | null = null;
    for (const event of events) {
      if (!currentState && event.type === 'PaymentCreated') {
        currentState = PaymentState.CREATED;
        continue;
      }
      if (currentState) {
        currentState = applyPaymentEvent(currentState, event);
      }
    }

    if (!currentState) {
      throw new Error('Invalid event stream: missing PaymentCreated');
    }

    const authorizeEvent: PaymentAuthorized = {
      type: 'PaymentAuthorized',
      paymentId: command.paymentId,
      occurredAt: new Date(),
    };

    // Validates if transition is allowed
    applyPaymentEvent(currentState, authorizeEvent);

    // Append event, expectedVersion is current number of events
    await this.paymentRepository.appendEvents(command.paymentId, [authorizeEvent], events.length);
  }
}
