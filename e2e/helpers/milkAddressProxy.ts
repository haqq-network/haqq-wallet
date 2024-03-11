import 'dotenv/config';
import * as process from 'process';

import {log} from 'detox';
import {BigNumber, Wallet, utils} from 'ethers';

import {PROVIDER, SOURCE_WALLET} from '../test-variables';

const MINIMUM_REQUIRED_BALANCE = utils.parseEther('0.15');

if (!process.env.DETOX_MILK_PRIVATE_KEY) {
  throw new Error('Missing DETOX_MILK_PRIVATE_KEY env');
}

declare global {
  var MilkAddressProxyInstance: MilkAddressProxy;
}

class MilkAddressProxy {
  private proxy: Wallet | null = null;
  private milkAddress: Wallet = new Wallet(SOURCE_WALLET, PROVIDER);

  constructor() {
    if (globalThis.MilkAddressProxyInstance) {
      return globalThis.MilkAddressProxyInstance;
    }
    globalThis.MilkAddressProxyInstance = this;
    this.milkAddress = new Wallet(SOURCE_WALLET, PROVIDER);
  }

  get address() {
    if (!this.proxy) {
      throw new Error('Current proxy is not initialized');
    }

    return this.proxy.address;
  }

  initialize = async () => {
    if (this.proxy) {
      return;
    }
    await this.generateNewProxy();
    await this.verifyMilkAddress();
    await this.sendRequiredMoneyToProxy();
  };

  verifyMilkAddress = async () => {
    if (this.milkAddress.provider) {
      return;
    }
    this.milkAddress = new Wallet(SOURCE_WALLET, PROVIDER);
  };

  generateNewProxy = async () => {
    if (this.proxy) {
      await this.sendAllBalanceToMilk();
    }
    const mnemonic = utils.entropyToMnemonic(utils.randomBytes(32));
    const wallet = Wallet.fromMnemonic(mnemonic).connect(PROVIDER);
    this.proxy = wallet;
    log.warn(`New proxy generated: ${this.proxy.address}`);
  };

  private sendAllBalanceTo = async (address: string) => {
    if (!this.proxy) {
      throw new Error('Current proxy is not initialized');
    }

    // TODO: Implement estimateGas
    const gas = utils.parseEther('0.001');
    const currentBalance = await this.proxy.getBalance();
    log.warn(`Proxy balance at the end: ${utils.formatEther(currentBalance)}`);
    if (currentBalance.gt(gas)) {
      await this.send(address, currentBalance.sub(gas));
    }
  };

  send = async (address: string, amount: BigNumber) => {
    if (!this.proxy) {
      throw new Error('Current proxy is not initialized');
    }

    log.warn(
      `${this.proxy.address} ---${utils.formatEther(
        amount,
      )} ISLM ---> ${address} ...`,
    );
    const tx = {
      to: address,
      value: amount,
    };

    const result = await this.proxy.sendTransaction(tx);
    log.warn(`Result: ${JSON.stringify(result)}`);
  };

  private sendAllBalanceToMilk = async () => {
    await this.sendAllBalanceTo(this.milkAddress.address);
  };

  sendRequiredMoneyToProxy = async () => {
    if (!this.proxy) {
      throw new Error('Current proxy is not initialized');
    }
    const currentBalance = await this.proxy.getBalance();
    if (currentBalance.gte(MINIMUM_REQUIRED_BALANCE)) {
      log.warn(
        `${this.proxy.address} has enough money, skipping sendRequiredMoneyToProxy call`,
      );
      return;
    }

    const tx = {
      to: this.proxy.address,
      value: MINIMUM_REQUIRED_BALANCE,
    };

    log.warn(
      `${this.milkAddress.address} ---${utils.formatEther(
        MINIMUM_REQUIRED_BALANCE,
      )} ISLM ---> ${this.proxy.address} ...`,
    );

    // TODO: Check for errors
    const result = await this.milkAddress.sendTransaction(tx);
    log.warn(`Result: ${JSON.stringify(result)}`);
  };

  destroy = async () => {
    await this.sendAllBalanceToMilk();
  };
}

const instance = new MilkAddressProxy();
export {instance as MilkAddressProxy};
