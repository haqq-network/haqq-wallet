export class SecureValue<T> {
  private readonly _value: T;

  constructor(value: T) {
    this._value = value;

    Object.defineProperty(this, 'toJSON', {
      value: () => 'This is secured value, not for public usage',
      writable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'toString', {
      value: () => 'This is secured value, not for public usage',
      writable: true,
      configurable: true,
    });
  }

  get value() {
    return this._value;
  }
}
