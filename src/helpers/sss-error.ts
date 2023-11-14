export class SssError extends Error {
  constructor(
    message: 'signinNotRecovery' | 'signinNotExists' | 'signinSharesNotFound',
  ) {
    super(message); // (1)
    this.name = 'SssError'; // (2)
  }
}
