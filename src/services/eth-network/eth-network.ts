import {TransactionRequest} from '@ethersproject/abstract-provider';
import {Deferrable} from '@ethersproject/properties';
import {ProviderInterface} from '@haqq/provider-base';
import {BigNumber, utils} from 'ethers';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {getRemoteBalanceValue} from '@app/helpers/get-remote-balance-value';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {getDefaultChainId} from '@app/network';
import {Balance} from '@app/services/balance';
import {getERC721TransferData} from '@app/services/eth-network/erc721';
import {storage} from '@app/services/mmkv';
import {applyEthTxMultiplier} from '@app/utils';

import {getERC20TransferData} from './erc20';
import {BALANCE_CACHE_KEY} from './types';

import {RemoteConfig} from '../remote-config';

export class EthNetwork {
  static chainId: number = getDefaultChainId();
  static explorer: string | undefined;

  static async populateTransaction(
    from: string,
    to: string,
    value: Balance,
    data: string = '0x',
    minGas = getRemoteBalanceValue('eth_min_gas_limit'),
    provider = app.provider,
  ) {
    try {
      if (!AddressUtils.isEthAddress(to)) {
        throw new Error('Invalid "from" address');
      }
      if (!AddressUtils.isEthAddress(from)) {
        throw new Error('Invalid "to" address');
      }
      const rpcProvider = await getRpcProvider(provider);
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
        maxFeePerGas: estimate.maxFeePerGas.toHex(),
        maxPriorityFeePerGas: estimate.maxPriorityFeePerGas.toHex(),
        gasLimit: estimate.estimateGas.toHex(),
        data,
        chainId: provider.ethChainId,
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
    } catch (error) {
      Logger.captureException(error, 'EthNetwork.populateTransaction', {
        from,
        to,
        value,
        data,
        minGas,
        provider: provider.name,
      });
      throw error;
    }
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
    provider = app.provider,
  ): Promise<{
    feeWei: Balance;
    gasPrice: Balance;
    estimateGas: Balance;
    maxFeePerGas: Balance;
    maxPriorityFeePerGas: Balance;
  }> {
    const rpcProvider = await getRpcProvider(provider);

    const feeData = await rpcProvider.getFeeData();

    if (!feeData?.gasPrice) {
      throw new Error('Gas price not found');
    }

    const gasPrice = new Balance(feeData.gasPrice, 18);
    const maxFeePerGas = new Balance(feeData.maxFeePerGas || gasPrice, 18);
    const maxPriorityFeePerGas = new Balance(
      feeData.maxPriorityFeePerGas || gasPrice,
      18,
    );

    let estimateGas = minGas;

    try {
      const estGas = await rpcProvider.estimateGas({
        from,
        to,
        data,
        value: value.toHex(),
      } as Deferrable<TransactionRequest>);

      if (RemoteConfig.get('enable_eth_commission_multiplier')) {
        estimateGas = applyEthTxMultiplier(new Balance(estGas)).max(minGas);
      } else {
        estimateGas = new Balance(estGas).max(minGas);
      }
    } catch (err) {
      Logger.captureException(err, 'EthNetwork.estimateTransaction error');
      throw err;
    }

    return {
      feeWei: estimateGas.operate(gasPrice, 'mul'),
      gasPrice,
      estimateGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
    };
  }

  private static getBalanceCacheKey = (address: string) =>
    BALANCE_CACHE_KEY + address.toLowerCase();

  async transferTransaction(
    transport: ProviderInterface,
    wallet: Wallet,
    to: string,
    amount: Balance,
  ) {
    try {
      const transaction = await EthNetwork.populateTransaction(
        wallet.address,
        to,
        amount,
      );
      const signedTx = await transport.signTransaction(
        wallet.path!,
        transaction,
      );

      if (!signedTx) {
        throw new Error('signedTx not found');
      }

      return await EthNetwork.sendTransaction(signedTx);
    } catch (error) {
      Logger.captureException(error, 'EthNetwork.transferTransaction', {
        amount,
        walletType: wallet.type,
        from: wallet.address,
        hdPath: wallet.path || 'null',
        to,
      });
      throw error;
    }
  }

  static async estimateERC20Transfer(
    from: string,
    to: string,
    amount: Balance,
    contractAddress: string,
    provider = app.provider,
  ) {
    const data = getERC20TransferData(to, amount, contractAddress);
    return await EthNetwork.estimateTransaction(
      from,
      contractAddress,
      Balance.Empty,
      data,
      getRemoteBalanceValue('eth_min_gas_limit'),
      provider,
    );
  }

  async transferERC20(
    transport: ProviderInterface,
    from: Wallet,
    to: string,
    amount: Balance,
    contractAddress: string,
  ) {
    try {
      const data = getERC20TransferData(to, amount, contractAddress);
      const unsignedTx = await EthNetwork.populateTransaction(
        from.address,
        contractAddress,
        Balance.Empty,
        data,
      );

      const signedTx = await transport.signTransaction(from.path!, unsignedTx);

      return await EthNetwork.sendTransaction(signedTx);
    } catch (error) {
      Logger.captureException(error, 'EthNetwork.transferERC20', {
        amount,
        contractAddress,
        from: from.address,
        to,
        hdPath: from.path || 'null',
      });
      throw error;
    }
  }

  static async estimateERC721Transfer(
    from: string,
    to: string,
    tokenId: number,
    contractAddress: string,
    provider = app.provider,
  ) {
    const data = getERC721TransferData(from, to, tokenId);
    return await EthNetwork.estimateTransaction(
      from,
      contractAddress,
      Balance.Empty,
      data,
      getRemoteBalanceValue('eth_min_gas_limit'),
      provider,
    );
  }

  async transferERC721(
    transport: ProviderInterface,
    from: Wallet,
    to: string,
    tokenId: number,
    contractAddress: string,
  ) {
    try {
      const data = getERC721TransferData(from.address, to, tokenId);
      const unsignedTx = await EthNetwork.populateTransaction(
        from.address,
        contractAddress,
        Balance.Empty,
        data,
      );

      const signedTx = await transport.signTransaction(from.path!, unsignedTx);

      return await EthNetwork.sendTransaction(signedTx);
    } catch (error) {
      Logger.captureException(error, 'EthNetwork.transferERC20', {
        tokenId,
        contractAddress,
        from: from.address,
        to,
        hdPath: from.path || 'null',
      });
      throw error;
    }
  }
}
