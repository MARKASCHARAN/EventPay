import { PaymentState } from './PaymentState';
import { PaymentDomainEvent } from './PaymentDomainEvent';
import { transition } from './PaymentStateMachine';
import { mapDomainEventToFSMEvent } from './PaymentEventMapper';

export function applyPaymentEvent(
  currentState: PaymentState,
  event: PaymentDomainEvent
): PaymentState {
  if (event.type === 'PaymentCreated') {
    return PaymentState.CREATED;
  }

  const fsmEvent = mapDomainEventToFSMEvent(event);
  return transition(currentState, fsmEvent);
}
