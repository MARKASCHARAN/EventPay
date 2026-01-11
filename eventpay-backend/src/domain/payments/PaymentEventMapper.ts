import { PaymentEvent } from './PaymentEvent';
import { PaymentDomainEvent } from './PaymentDomainEvent';

export function mapDomainEventToFSMEvent(
  event: PaymentDomainEvent
): PaymentEvent {
  switch (event.type) {
    case 'PaymentAuthorized':
      return PaymentEvent.AUTHORIZE;

    case 'PaymentCaptured':
      return PaymentEvent.CAPTURE;

    case 'PaymentFailed':
      return PaymentEvent.FAIL;

    case 'PaymentCancelled':
      return PaymentEvent.CANCEL;

    default:
      throw new Error(`No FSM mapping for event: ${event['type']}`);
  }
}
