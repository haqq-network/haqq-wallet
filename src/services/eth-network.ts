import {BigNumber, utils} from 'ethers';
import {Wallet as EthersWallet} from '@ethersproject/wallet';
import {Deferrable} from '@ethersproject/properties';
import {TransactionRequest} from '@ethersproject/abstract-provider';
import {UnsignedTransaction} from '@ethersproject/transactions/src.ts';
import {getChainId, getDefaultNetwork} from '../network';
import {Wallet} from '../models/wallet';
import {WalletType} from '../types';
import {app} from '../contexts/app';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import AppEth, {ledgerService} from '@ledgerhq/hw-app-eth';

export class EthNetwork {
  private wallet: Wallet;
  private network = getDefaultNetwork();
  private path = "44'/60'/0'/0/0";

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

    const response = await this.network.sendTransaction(signedTx);

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
    const wallet = new EthersWallet(this.wallet.privateKey, this.network);

    return wallet.signTransaction(transaction);
  }

  async getSignedTxForLedger(transaction: UnsignedTransaction) {
    const unsignedTx = utils.serializeTransaction(transaction).substring(2);
    const transport = await TransportBLE.open(this.wallet.deviceId);
    const eth = new AppEth(transport);
    const resolution = await ledgerService.resolveTransaction(
      unsignedTx,
      {},
      {},
    );

    const signature = await eth.signTransaction(
      this.path,
      unsignedTx,
      resolution,
    );

    return utils.serializeTransaction(transaction, {
      ...signature,
      r: '0x' + signature.r,
      s: '0x' + signature.s,
      v: parseInt(signature.v),
    });
  }

  static async populateTransaction(from: string, to: string, amount: string) {
    const value = utils.parseEther(amount.toString());
    const nonce = await getDefaultNetwork().getTransactionCount(from, 'latest');

    const estimateGas = await getDefaultNetwork().estimateGas({
      from,
      to,
      amount,
    } as Deferrable<TransactionRequest>);

    let gasPrice = await getDefaultNetwork().getGasPrice();

    const transaction = {
      to: to,
      value: value._hex,
      nonce,
      type: 2,
      maxFeePerGas: gasPrice._hex,
      maxPriorityFeePerGas: gasPrice._hex,
      gasLimit: estimateGas._hex,
      data: '0x',
      chainId: getChainId(),
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

    // const unsignedTx = utils.serializeTransaction(baseTx);
    //
    // return {
    //   transaction,
    //   unsignedTx,
    // };
  }
}
