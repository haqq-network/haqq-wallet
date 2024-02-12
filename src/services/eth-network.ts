import {TransactionRequest} from '@ethersproject/abstract-provider';
import {Deferrable} from '@ethersproject/properties';
import {ProviderInterface} from '@haqq/provider-base';
import {BigNumber, utils} from 'ethers';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {
  getRemoteBalanceValue,
  getRemoteMultiplierValue,
} from '@app/helpers/get-remote-balance-value';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {Contracts} from '@app/models/contracts';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Wallet} from '@app/models/wallet';
import {getDefaultChainId} from '@app/network';
import {Balance} from '@app/services/balance';
import {storage} from '@app/services/mmkv';
import {decimalToHex} from '@app/utils';
import {WEI_PRECISION} from '@app/variables/common';

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
        data,
        value: value.toHex(),
      } as Deferrable<TransactionRequest>);

      // TODO Investigate and fix new Balance issue when number used instead of hex
      estimateGas = new Balance(
        decimalToHex(
          String(
            // Convert to int because decimalToHex incorrectly parse decimals work only with integers
            parseInt(
              String(
                // Multiply by eth_commission_multiplier
                estGas.toNumber() *
                  getRemoteMultiplierValue('eth_commission_multiplier'),
              ),
              10,
            ),
          ),
        ),
      ).max(minGas);
    } catch (err) {
      Logger.error(
        'EthNetwork.estimateTransaction error',
        JSON.stringify(err, null, 2),
      );
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

    const haqqContractAddress = AddressUtils.toHaqq(contractAddress);
    const contractInfo =
      Contracts.getById(haqqContractAddress) ||
      Token.getById(haqqContractAddress);

    const decimals = contractInfo.decimals ?? WEI_PRECISION;

    const [amountClear] = new Balance(amount.toWei(), 0)
      .operate(Math.pow(10, amount.getPrecission()), 'div')
      .operate(Math.pow(10, decimals), 'mul')
      .toWei()
      .toString()
      .split('.');

    const data = iface.encodeFunctionData(ABI_ERC20_TRANSFER_ACTION.name, [
      to,
      amountClear,
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
