import { PaymentState } from './PaymentState';
import { PaymentEvent } from './PaymentEvent';
import {
  InvalidPaymentStateTransition,
  PaymentAlreadyFinalized
} from './PaymentErrors';

type StateTransitionTable = {
  [state in PaymentState]: Partial<Record<PaymentEvent, PaymentState>>;
};

const transitions: StateTransitionTable = {
  [PaymentState.CREATED]: {
    [PaymentEvent.AUTHORIZE]: PaymentState.AUTHORIZED,
    [PaymentEvent.CANCEL]: PaymentState.CANCELLED,
    [PaymentEvent.FAIL]: PaymentState.FAILED
  },

  [PaymentState.AUTHORIZED]: {
    [PaymentEvent.CAPTURE]: PaymentState.CAPTURED,
    [PaymentEvent.CANCEL]: PaymentState.CANCELLED,
    [PaymentEvent.FAIL]: PaymentState.FAILED
  },

  [PaymentState.CAPTURED]: {},     
  [PaymentState.FAILED]: {},        
  [PaymentState.CANCELLED]: {}      
};

export function transition(
  currentState: PaymentState,
  event: PaymentEvent
): PaymentState {
  const possibleTransitions = transitions[currentState];

  if (!possibleTransitions) {
    throw new InvalidPaymentStateTransition(currentState, event);
  }

  const nextState = possibleTransitions[event];

  if (!nextState) {
    if (
      currentState === PaymentState.CAPTURED ||
      currentState === PaymentState.FAILED ||
      currentState === PaymentState.CANCELLED
    ) {
      throw new PaymentAlreadyFinalized(currentState);
    }

    throw new InvalidPaymentStateTransition(currentState, event);
  }

  return nextState;
}
