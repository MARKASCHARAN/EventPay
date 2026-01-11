import { describe, it, expect } from 'vitest';
import { applyPaymentEvent } from './applyPaymentEvent';
import { PaymentState } from './PaymentState';

describe('applyPaymentEvent', () => {
  it('moves CREATED → AUTHORIZED on PaymentAuthorized event', () => {
    const next = applyPaymentEvent(PaymentState.CREATED, {
      type: 'PaymentAuthorized',
      paymentId: 'p1',
      occurredAt: new Date()
    });

    expect(next).toBe(PaymentState.AUTHORIZED);
  });

  it('throws on illegal event application', () => {
    expect(() =>
      applyPaymentEvent(PaymentState.CREATED, {
        type: 'PaymentCaptured',
        paymentId: 'p1',
        occurredAt: new Date()
      })
    ).toThrow();
  });
});
