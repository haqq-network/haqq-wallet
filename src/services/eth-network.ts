import {TransactionRequest} from '@ethersproject/abstract-provider';
import {Deferrable} from '@ethersproject/properties';
import {ProviderInterface} from '@haqq/provider-base';
import {BigNumber, utils} from 'ethers';

import {app} from '@app/contexts';
import {getRemoteBalanceValue} from '@app/helpers/get-remote-balance-value';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {getDefaultChainId} from '@app/network';
import {Balance} from '@app/services/balance';
import {storage} from '@app/services/mmkv';

export const ABI_ERC20_TRANSFER_ACTION = {
  name: 'transfer',
  type: 'function',
  inputs: [
    {
      name: '_to',
      type: 'address',
    },
    {
      type: 'uint256',
      name: '_tokens',
    },
  ],
  constant: false,
  outputs: [],
  payable: false,
};

const BALANCE_CACHE_KEY = 'balance_storage';

export class EthNetwork {
  static chainId: number = getDefaultChainId();
  static explorer: string | undefined;

  static async populateTransaction(
    from: string,
    to: string,
    value: Balance,
    data: string = '0x',
    minGas = getRemoteBalanceValue('eth_min_gas_limit'),
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
      const balanceResponse = await rpcProvider.getBalance(address);
      const balanceWithWEI = new Balance(balanceResponse._hex);
      const balance = new Balance(balanceWithWEI);

      // Caching balance
      const key = this.getBalanceCacheKey(address);
      const value = balance.toHex();
      storage.setItem(key, value);

      return balance;
    } catch (e) {
      // Trying to find cached balance for this wallet
      const key = this.getBalanceCacheKey(address);
      const possibleBalance = storage.getItem(key) as string | undefined;

      return new Balance(possibleBalance ?? Balance.Empty);
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
    minGas: Balance = getRemoteBalanceValue('eth_min_gas_limit'),
  ): Promise<{
    feeWei: Balance;
    gasPrice: Balance;
    estimateGas: Balance;
  }> {
    const rpcProvider = await getRpcProvider(app.provider);

    const getGasPrice = await rpcProvider.getGasPrice();
    const gasPrice = new Balance(getGasPrice._hex);
    let estimateGas = minGas;

    try {
      const estGas = await rpcProvider.estimateGas({
        from,
        to,
        value: value.toHex(),
        data,
        maxFeePerGas: gasPrice.toHex(),
        maxPriorityFeePerGas: gasPrice.toHex(),
      } as Deferrable<TransactionRequest>);

      estimateGas = new Balance(
        estGas.toNumber() *
          getRemoteBalanceValue('eth_commission_multiplier').toNumber(),
      ).max(minGas);
    } catch {
      //
    }

    return {
      feeWei: estimateGas.operate(gasPrice, 'mul'),
      gasPrice,
      estimateGas,
    };
  }

  private static getBalanceCacheKey = (address: string) =>
    BALANCE_CACHE_KEY + address.toLowerCase();

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

  async transferERC20(
    transport: ProviderInterface,
    from: Wallet,
    to: string,
    amount: Balance,
    contractAddress: string,
  ) {
    const abi = [ABI_ERC20_TRANSFER_ACTION];
    const iface = new utils.Interface(abi);
    const data = iface.encodeFunctionData(ABI_ERC20_TRANSFER_ACTION.name, [
      to,
      amount.toHex(),
    ]);

    const unsignedTx = await EthNetwork.populateTransaction(
      from.address,
      contractAddress,
      Balance.Empty,
      data,
    );

    const signedTx = await transport.signTransaction(from.path!, unsignedTx);

    return await EthNetwork.sendTransaction(signedTx);
  }
}
