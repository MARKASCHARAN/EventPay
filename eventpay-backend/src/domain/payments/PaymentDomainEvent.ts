export interface BasePaymentEvent {
  readonly paymentId: string;
  readonly occurredAt: Date;
}

export interface PaymentCreated extends BasePaymentEvent {
  readonly type: 'PaymentCreated';
  readonly amount: number;
  readonly currency: string;
}

export interface PaymentAuthorized extends BasePaymentEvent {
  readonly type: 'PaymentAuthorized';
}

export interface PaymentCaptured extends BasePaymentEvent {
  readonly type: 'PaymentCaptured';
}

export interface PaymentFailed extends BasePaymentEvent {
  readonly type: 'PaymentFailed';
  readonly reason: string;
}

export interface PaymentCancelled extends BasePaymentEvent {
  readonly type: 'PaymentCancelled';
}

export type PaymentDomainEvent =
  | PaymentCreated
  | PaymentAuthorized
  | PaymentCaptured
  | PaymentFailed
  | PaymentCancelled;
