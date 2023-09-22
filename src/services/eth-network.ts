import {TransactionRequest} from '@ethersproject/abstract-provider';
import {Deferrable} from '@ethersproject/properties';
import {ProviderInterface} from '@haqq/provider-base';
import {BigNumber, utils} from 'ethers';

import {app} from '@app/contexts';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {Provider} from '@app/models/provider';
import {getDefaultChainId} from '@app/network';
import {Balance, MIN_GAS_LIMIT} from '@app/services/balance';

export class EthNetwork {
  static chainId: number = getDefaultChainId();
  static explorer: string | undefined;

  static async populateTransaction(
    from: string,
    to: string,
    value: Balance,
    data: string = '0x',
    minGas = MIN_GAS_LIMIT,
  ) {
    const rpcProvider = await getRpcProvider(app.provider);

    const nonce = await rpcProvider.getTransactionCount(from, 'latest');

    const estimate = await EthNetwork.estimateTransaction(
      from,
      to,
      value,
      data,
      minGas,
    );

    const transaction = {
      to: to,
      value: value.toHex(),
      nonce,
      type: 2,
      maxFeePerGas: estimate.gasPrice.toHex(),
      maxPriorityFeePerGas: estimate.gasPrice.toHex(),
      gasLimit: estimate.estimateGas.toHex(),
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
      const balanceWithWEI = new Balance(balance._hex);
      return new Balance(balanceWithWEI);
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
    value: Balance,
    data = '0x',
    minGas: Balance = MIN_GAS_LIMIT,
  ): Promise<{
    feeWei: Balance;
    gasPrice: Balance;
    estimateGas: Balance;
  }> {
    const rpcProvider = await getRpcProvider(app.provider);

    const getGasPrice = await rpcProvider.getGasPrice();
    const gasPrice = new Balance(getGasPrice._hex);

    const estGas = await rpcProvider.estimateGas({
      from,
      to,
      value: value.toHex(),
      data,
      maxFeePerGas: gasPrice.toHex(),
      maxPriorityFeePerGas: gasPrice.toHex(),
    } as Deferrable<TransactionRequest>);

    const estimateGas = new Balance(estGas._hex).max(minGas);

    return {
      feeWei: estimateGas.operate(gasPrice, 'mul'),
      gasPrice,
      estimateGas,
    };
  }

  async transferTransaction(
    transport: ProviderInterface,
    hdPath: string,
    to: string,
    amount: Balance,
  ) {
    const {address} = await transport.getAccountInfo(hdPath);
    const transaction = await EthNetwork.populateTransaction(
      address,
      to,
      amount,
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
