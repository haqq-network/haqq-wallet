export class MpcError extends Error {
  constructor(message: 'signinNotRecovery' | 'signinNotExists') {
    super(message); // (1)
    this.name = 'MpcError'; // (2)
  }
}
