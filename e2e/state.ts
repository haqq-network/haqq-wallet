export class State {
  static instance = new State();
  private _value: string;

  set_value(value: string) {
    this._value = value;
  }

  get_value() {
    return this._value;
  }
}
