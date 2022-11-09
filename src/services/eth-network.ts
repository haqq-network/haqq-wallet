import {TransactionRequest} from '@ethersproject/abstract-provider';
import {FeeData} from '@ethersproject/abstract-provider/src.ts';
import {Deferrable} from '@ethersproject/properties';
import {UnsignedTransaction} from '@ethersproject/transactions/src.ts';
import {Wallet as EthersWallet} from '@ethersproject/wallet';
import {ledgerService} from '@ledgerhq/hw-app-eth';
import {BigNumber, BigNumberish, ethers, utils} from 'ethers';

import {app} from '../contexts/app';
import {calcFee} from '../helpers/calc-fee';
import {runUntil} from '../helpers/run-until';
import {Provider} from '../models/provider';
import {Wallet} from '../models/wallet';
import {getDefaultChainId, getDefaultNetwork} from '../network';
import {WalletType} from '../types';
import {ETH_HD_PATH} from '../variables';

export class EthNetwork {
  static network: ethers.providers.StaticJsonRpcProvider = getDefaultNetwork();
  static chainId: number = getDefaultChainId();
  static explorer: string | undefined;
  private wallet: Wallet;
  public stop = false;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  async sendTransaction(to: string, amount: string | number) {
    const transaction = await EthNetwork.populateTransaction(
      this.wallet.address,
      to,
      String(amount),
    );

    const signedTx = await this.getSignedTx(transaction);

    if (!signedTx) {
      throw new Error('signedTx not found');
    }

    const response = await EthNetwork.network.sendTransaction(signedTx);

    return response;
  }

  getSignedTx(transaction: TransactionRequest | UnsignedTransaction) {
    switch (this.wallet.type) {
      case WalletType.hot:
        return this.getSignedTxForHot(transaction as TransactionRequest);
      case WalletType.ledgerBt:
        return this.getSignedTxForLedger(transaction as UnsignedTransaction);
      default:
        throw new Error('wallet type not found');
    }
  }

  async getSignedTxForHot(transaction: TransactionRequest) {
    if (!this.wallet.isEncrypted) {
      const password = await app.getPassword();
      await this.wallet.decrypt(password);
    }

    if (!this.wallet.privateKey) {
      throw new Error('private key not found');
    }
    const wallet = new EthersWallet(this.wallet.privateKey, EthNetwork.network);

    return wallet.signTransaction(transaction);
  }

  async getSignedTxForLedger(transaction: UnsignedTransaction) {
    const unsignedTx = utils.serializeTransaction(transaction).substring(2);
    const resolution = await ledgerService.resolveTransaction(
      unsignedTx,
      {},
      {},
    );

    let signature = null;

    const iter = runUntil(this.wallet.deviceId!, eth =>
      eth.signTransaction(ETH_HD_PATH, unsignedTx, resolution),
    );

    let done = false;
    do {
      const resp = await iter.next();
      signature = resp.value;
      done = resp.done;
    } while (!done && !this.stop);

    await iter.abort();

    if (!signature) {
      throw new Error('can_not_connected');
    }

    return utils.serializeTransaction(transaction, {
      ...signature,
      r: '0x' + signature.r,
      s: '0x' + signature.s,
      v: parseInt(signature.v, 10),
    });
  }

  static async populateTransaction(from: string, to: string, amount: string) {
    const value = utils.parseEther(amount.toString());
    const nonce = await EthNetwork.network.getTransactionCount(from, 'latest');

    const estimateGas = await EthNetwork.network.estimateGas({
      from,
      to,
      amount,
    } as Deferrable<TransactionRequest>);

    let gasPrice = await EthNetwork.network.getGasPrice();

    const transaction = {
      to: to,
      value: value._hex,
      nonce,
      type: 2,
      maxFeePerGas: gasPrice._hex,
      maxPriorityFeePerGas: gasPrice._hex,
      gasLimit: estimateGas._hex,
      data: '0x',
      chainId: EthNetwork.chainId,
    };

    const tx = await utils.resolveProperties(transaction);

    return {
      chainId: tx.chainId || undefined,
      data: tx.data || undefined,
      gasLimit: tx.gasLimit || undefined,
      type: tx.type,
      maxFeePerGas: tx.maxFeePerGas || undefined,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas || undefined,
      nonce: tx.nonce ? BigNumber.from(tx.nonce).toNumber() : undefined,
      to: tx.to || undefined,
      value: tx.value || undefined,
    };
  }

  static async getBalance(address: string) {
    const balance = await EthNetwork.network.getBalance(address);
    return Number(utils.formatEther(balance));
  }

  static init(provider: Provider) {
    EthNetwork.chainId = provider.chainId;
    EthNetwork.explorer = provider.explorer;
    EthNetwork.network = provider.rpcProvider;
  }

  static async estimateTransaction(
    from: string,
    to: string,
    amount: number,
  ): Promise<{
    fee: number;
    feeData: FeeData;
    estimateGas: BigNumberish;
  }> {
    const result = await Promise.all([
      EthNetwork.network.getFeeData(),
      EthNetwork.network.estimateGas({
        from,
        to,
        amount,
      } as Deferrable<TransactionRequest>),
    ]);

    return {
      fee: calcFee(result[0].maxFeePerGas!, result[1]),
      feeData: result[0],
      estimateGas: result[1],
    };
  }
}
