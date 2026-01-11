import { PaymentState } from './PaymentState';

export interface PaymentProps {
  id: string;
  amount: number;
  currency: string;
  state: PaymentState;
  createdAt: Date;
}

export class Payment {
  private readonly _id: string;
  private readonly _amount: number;
  private readonly _currency: string;
  private _state: PaymentState;
  private readonly _createdAt: Date;

  private constructor(props: PaymentProps) {
    this._id = props.id;
    this._amount = props.amount;
    this._currency = props.currency;
    this._state = props.state;
    this._createdAt = props.createdAt;
  }

  static create(props: Omit<PaymentProps, 'state'>): Payment {
    return new Payment({
      ...props,
      state: PaymentState.CREATED
    });
  }

  get id() {
    return this._id;
  }

  get amount() {
    return this._amount;
  }

  get currency() {
    return this._currency;
  }

  get state() {
    return this._state;
  }

  get createdAt() {
    return this._createdAt;
  }

  // State mutation ONLY via controlled methods (later FSM)
  protected setState(state: PaymentState) {
    this._state = state;
  }
}
