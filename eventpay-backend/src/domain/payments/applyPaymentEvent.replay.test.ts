import { describe, it, expect } from 'vitest';
import { applyPaymentEvent } from './applyPaymentEvent';
import { PaymentState } from './PaymentState';
import { PaymentDomainEvent } from './PaymentDomainEvent';

describe('Payment event replay', () => {
  it('rebuilds state from ordered events', () => {
    const events: PaymentDomainEvent[] = [
      {
        type: 'PaymentCreated',
        paymentId: 'p1',
        occurredAt: new Date()
      },
      {
        type: 'PaymentAuthorized',
        paymentId: 'p1',
        occurredAt: new Date()
      },
      {
        type: 'PaymentCaptured',
        paymentId: 'p1',
        occurredAt: new Date()
      }
    ];

    const finalState = events.reduce(
      (state, event) => applyPaymentEvent(state, event),
      PaymentState.CREATED
    );

    expect(finalState).toBe(PaymentState.CAPTURED);
  });
});
