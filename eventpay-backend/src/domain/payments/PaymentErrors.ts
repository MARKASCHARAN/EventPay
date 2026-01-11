export class InvalidPaymentStateTransition extends Error {
  constructor(from: string, to: string) {
    super(`Invalid payment state transition: ${from} → ${to}`);
  }
}

export class PaymentAlreadyFinalized extends Error {
  constructor(state: string) {
    super(`Payment is already finalized in state: ${state}`);
  }
}
