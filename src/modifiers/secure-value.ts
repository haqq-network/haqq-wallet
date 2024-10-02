export class SecureValue<T> {
  private readonly value: T;

  constructor(value: T) {
    this.value = value;

    this.toString = () => {
      return 'This is secured value, not for public usage';
    };
  }

  getValue(): T {
    return this.value;
  }
}
