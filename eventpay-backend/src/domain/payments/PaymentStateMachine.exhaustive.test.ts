import { describe, it, expect } from 'vitest';
import { transition } from './PaymentStateMachine';
import { PaymentState } from './PaymentState';
import { PaymentEvent } from './PaymentEvent';

describe('PaymentStateMachine exhaustive checks', () => {
  it('allows all valid transitions', () => {
    expect(transition(PaymentState.CREATED, PaymentEvent.AUTHORIZE))
      .toBe(PaymentState.AUTHORIZED);

    expect(transition(PaymentState.AUTHORIZED, PaymentEvent.CAPTURE))
      .toBe(PaymentState.CAPTURED);
  });

  it('rejects all invalid transitions from CREATED', () => {
    expect(() =>
      transition(PaymentState.CREATED, PaymentEvent.CAPTURE)
    ).toThrow();
  });

  it('rejects any transition from terminal states', () => {
    const terminalStates = [
      PaymentState.CAPTURED,
      PaymentState.FAILED,
      PaymentState.CANCELLED
    ];

    for (const state of terminalStates) {
      expect(() =>
        transition(state, PaymentEvent.AUTHORIZE)
      ).toThrow();
    }
  });
});
