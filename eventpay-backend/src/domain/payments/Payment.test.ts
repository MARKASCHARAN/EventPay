import { describe, it, expect } from 'vitest';
import { Payment } from './Payment';

describe('Payment aggregate invariants', () => {
  it('creates payment only via factory', () => {
    const payment = Payment.create({
      id: 'p1',
      amount: 1000,
      currency: 'INR',
      createdAt: new Date()
    });

    expect(payment.amount).toBe(1000);
  });

  it('prevents runtime mutation of amount', () => {
    const payment = Payment.create({
      id: 'p1',
      amount: 1000,
      currency: 'INR',
      createdAt: new Date()
    });

    expect(() => {
      // force runtime mutation attempt
      (payment as any).amount = 2000;
    }).toThrow(TypeError);
  });
});
