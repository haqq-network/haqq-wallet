export class SssError extends Error {
  constructor(message: 'signinNotRecovery' | 'signinNotExists') {
    super(message); // (1)
    this.name = 'SssError'; // (2)
  }
}
