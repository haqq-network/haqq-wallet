import {TransactionRequest} from '@ethersproject/abstract-provider';
import {FeeData} from '@ethersproject/abstract-provider/src.ts';
import {Deferrable} from '@ethersproject/properties';
import {ProviderInterface} from '@haqq/provider-base';
import BN from 'bn.js';
import {BigNumber, BigNumberish, utils} from 'ethers';

import {app} from '@app/contexts';
import {calcFeeWei} from '@app/helpers';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {Provider} from '@app/models/provider';
import {getDefaultChainId} from '@app/network';
import {Balance} from '@app/services/balance';
import {WEI} from '@app/variables/common';

export class EthNetwork {
  static chainId: number = getDefaultChainId();
  static explorer: string | undefined;

  static async populateTransaction(
    from: string,
    to: string,
    value: BN,
    data: string = '0x',
    minGas = 21000,
  ) {
    const rpcProvider = await getRpcProvider(app.provider);

    const nonce = await rpcProvider.getTransactionCount(from, 'latest');
    const gasPrice = await rpcProvider.getGasPrice();

    let estimateGas;
    try {
      const resp = await rpcProvider.estimateGas({
        from,
        to,
        value: '0x' + value.toString('hex'),
        maxFeePerGas: gasPrice.toHexString(),
        maxPriorityFeePerGas: gasPrice.toHexString(),
      } as Deferrable<TransactionRequest>);

      estimateGas = new BN(resp._hex, 16);
    } catch (e) {
      estimateGas = new BN(minGas);
    }

    estimateGas = BN.max(estimateGas, new BN(minGas));

    const transaction = {
      to: to,
      value: '0x' + value.toString('hex'),
      nonce,
      type: 2,
      maxFeePerGas: gasPrice._hex,
      maxPriorityFeePerGas: gasPrice._hex,
      gasLimit: '0x' + estimateGas.toString('hex'),
      data,
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

  static async getBalance(address: string): Promise<Balance> {
    try {
      const rpcProvider = await getRpcProvider(app.provider);
      const balance = await rpcProvider.getBalance(address);
      return new Balance(balance._hex);
    } catch (e) {
      return Balance.Empty;
    }
  }

  static async call(to: string, data: string) {
    const rpcProvider = await getRpcProvider(app.provider);
    return await rpcProvider.call({
      to,
      data,
    });
  }

  static async getCode(address: string) {
    try {
      const rpcProvider = await getRpcProvider(app.provider);
      return await rpcProvider.getCode(address);
    } catch (e) {
      return '0x';
    }
  }

  static async sendTransaction(signedTx: string) {
    const rpcProvider = await getRpcProvider(app.provider);

    return await rpcProvider.sendTransaction(signedTx);
  }

  static async getTransactionReceipt(txHash: string) {
    const rpcProvider = await getRpcProvider(app.provider);

    return await rpcProvider.getTransactionReceipt(txHash);
  }

  static init(provider: Provider) {
    EthNetwork.chainId = provider.ethChainId;
    EthNetwork.explorer = provider.explorer;
  }

  static async estimateTransaction(
    from: string,
    to: string,
    amount: number,
  ): Promise<{
    fee: number;
    feeWei: number;
    feeData: FeeData;
    estimateGas: BigNumberish;
  }> {
    const rpcProvider = await getRpcProvider(app.provider);

    const result = await Promise.all([
      rpcProvider.getFeeData(),
      rpcProvider.estimateGas({
        from,
        to,
        amount,
      } as Deferrable<TransactionRequest>),
    ]);

    const feeWei = calcFeeWei(result[0].gasPrice!, result[1]);

    return {
      fee: feeWei / WEI,
      feeWei,
      feeData: result[0],
      estimateGas: result[1],
    };
  }

  async transferTransaction(
    transport: ProviderInterface,
    hdPath: string,
    to: string,
    amount: string | number,
  ) {
    const {address} = await transport.getAccountInfo(hdPath);
    const transaction = await EthNetwork.populateTransaction(
      address,
      to,
      new BN(amount),
    );
    const signedTx = await transport.signTransaction(hdPath, transaction);

    if (!signedTx) {
      throw new Error('signedTx not found');
    }

    return await EthNetwork.sendTransaction(signedTx);
  }

  async callContract(abi: any[], to: string, method: string, ...params: any[]) {
    const iface = new utils.Interface(abi);
    const data = iface.encodeFunctionData(method, params);

    const resp = await EthNetwork.call(to, data);
    return iface.decodeFunctionResult(method, resp);
  }
}
