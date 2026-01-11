import { transition } from './PaymentStateMachine';
import { PaymentState } from './PaymentState';
import { PaymentEvent } from './PaymentEvent';

import {
  InvalidPaymentStateTransition,
  PaymentAlreadyFinalized
} from './PaymentErrors';

describe('PaymentStateMachine', () => {
  it('allows CREATED → AUTHORIZED', () => {
    expect(
      transition(PaymentState.CREATED, PaymentEvent.AUTHORIZE)
    ).toBe(PaymentState.AUTHORIZED);
  });

  it('prevents CAPTURE before AUTHORIZE', () => {
    expect(() =>
      transition(PaymentState.CREATED, PaymentEvent.CAPTURE)
    ).toThrow(InvalidPaymentStateTransition);
  });

  it('prevents transitions from terminal state', () => {
    expect(() =>
      transition(PaymentState.CAPTURED, PaymentEvent.CANCEL)
    ).toThrow(PaymentAlreadyFinalized);
  });
});
