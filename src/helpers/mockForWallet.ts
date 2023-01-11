export const mockForWallet = {
  get address(): string {
    return '';
  },
  get deviceId(): string {
    return '';
  },
  get path(): string {
    return '';
  },
  get publicKey() {
    return '';
  },
  set publicKey(value: string) {},
  getPrivateKey(): Promise<string> {
    return Promise.resolve('');
  },
};
