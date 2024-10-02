export class SecureValue<T> {
  private readonly _value: T;

  constructor(value: T) {
    this._value = value;

    this.toString = () => {
      return 'This is secured value, not for public usage';
    };
  }

  get value() {
    return this._value;
  }
}
