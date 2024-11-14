import {StorageInterface} from '@haqq/rn-wallet-providers';

import {Cloud} from '@app/services/cloud';

export class GoogleDrive2 implements StorageInterface {
  private instance: Cloud;

  constructor() {
    this.instance = new Cloud();
  }

  static isEnabled() {
    return true;
  }

  getName() {
    return 'googleDrive';
  }

  async getItem(key: string): Promise<string> {
    const value = await this.instance.getItem(key);
    return value ?? '';
  }

  async hasItem(key: string): Promise<boolean> {
    return this.instance.hasItem(key);
  }

  async setItem(key: string, value: string): Promise<boolean> {
    return this.instance.setItem(key, value);
  }

  async removeItem(key: string): Promise<boolean> {
    return this.instance.removeItem(key);
  }
}
