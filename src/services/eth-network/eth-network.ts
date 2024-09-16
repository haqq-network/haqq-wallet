import {TransactionRequest} from '@ethersproject/abstract-provider';
import {Deferrable} from '@ethersproject/properties';
import {ProviderInterface} from '@haqq/provider-base';
import Decimal from 'decimal.js';
import {BigNumber, utils} from 'ethers';

import {AddressUtils} from '@app/helpers/address-utils';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {EstimationVariant} from '@app/models/fee';
import {Provider, ProviderModel} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {getDefaultChainId} from '@app/network';
import {Balance} from '@app/services/balance';
import {getERC1155TransferData} from '@app/services/eth-network/erc1155';
import {getERC721TransferData} from '@app/services/eth-network/erc721';
import {storage} from '@app/services/mmkv';

import {getERC20TransferData} from './erc20';
import {
  BALANCE_CACHE_KEY,
  CalculatedFees,
  TxCustomEstimationParams,
  TxEstimationParams,
} from './types';

export class EthNetwork {
  static chainId: number = getDefaultChainId();
  static explorer: string | undefined;

  static init(provider: ProviderModel) {
    EthNetwork.chainId = provider.ethChainId;
    EthNetwork.explorer = provider.explorer;
  }

  static async populateTransaction(
    estimate: CalculatedFees,
    {from, to, value = Balance.Empty, data = '0x'}: TxEstimationParams,
    provider = Provider.selectedProvider,
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

      const transaction = {
        to: to,
        value: value.toHex(),
        nonce,
        type: 2,
        maxFeePerGas: estimate.maxBaseFee.toHex(),
        maxPriorityFeePerGas: estimate.maxPriorityFee.toHex(),
        gasLimit: estimate.gasLimit.toHex(),
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
        ...estimate,
        provider: provider.name,
      });
      throw error;
    }
  }

  static async getBalance(address: string): Promise<Balance> {
    try {
      const rpcProvider = await getRpcProvider(Provider.selectedProvider);
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
    const rpcProvider = await getRpcProvider(Provider.selectedProvider);
    return await rpcProvider.call({
      to,
      data,
    });
  }

  static async getCode(address: string) {
    try {
      const rpcProvider = await getRpcProvider(Provider.selectedProvider);
      return await rpcProvider.getCode(address);
    } catch (e) {
      return '0x';
    }
  }

  static async sendTransaction(
    signedTx: string,
    provider = Provider.selectedProvider,
  ) {
    const rpcProvider = await getRpcProvider(provider);
    return await rpcProvider.sendTransaction(signedTx);
  }

  static async getTransactionReceipt(
    txHash: string,
    provider = Provider.selectedProvider,
  ) {
    const rpcProvider = await getRpcProvider(provider);

    return await rpcProvider.getTransactionReceipt(txHash);
  }

  static async customEstimate(
    {from, to, value = Balance.Empty, data = '0x'}: TxEstimationParams,
    {gasLimit, maxBaseFee, maxPriorityFee}: TxCustomEstimationParams,
    provider = Provider.selectedProvider,
  ): Promise<CalculatedFees> {
    try {
      const rpcProvider = await getRpcProvider(provider);
      const block = await rpcProvider.getBlock('latest');
      const estimateGasLimit = await rpcProvider.estimateGas({
        from,
        to,
        data,
        value: value.toHex(),
      } as Deferrable<TransactionRequest>);

      const resultGasLimit = new Balance(
        new Decimal(
          gasLimit < estimateGasLimit.toNumber()
            ? estimateGasLimit.toNumber()
            : gasLimit,
        ),
      );

      const blockBaseFeePerGasGWEI = block.baseFeePerGas!.toNumber() / 10 ** 9;
      const resultMaxBaseFee = new Balance(
        new Balance(
          new Decimal(
            maxBaseFee < blockBaseFeePerGasGWEI
              ? blockBaseFeePerGasGWEI
              : maxBaseFee,
          ),
        ).toNumber() /
          10 ** 9,
      );

      const resultMaxPriorityFee = new Balance(
        maxPriorityFee / 10 ** 9,
        provider.decimals,
        provider.denom,
      );

      return {
        gasLimit: new Balance(
          resultGasLimit,
          provider.decimals,
          provider.denom,
        ),
        maxBaseFee: new Balance(
          resultMaxBaseFee,
          provider.decimals,
          provider.denom,
        ),
        maxPriorityFee: new Balance(
          maxPriorityFee,
          provider.decimals,
          provider.denom,
        ),
        expectedFee: new Balance(
          resultGasLimit.operate(
            resultMaxBaseFee.operate(resultMaxPriorityFee, 'add'),
            'mul',
          ),
          provider.decimals,
          provider.denom,
        ),
      };
    } catch (error) {
      Logger.captureException(error, 'EthNetwork.estimateTransaction error');
      throw error;
    }
  }

  /**
   *
   * @description Calculation formula for expectedFee gasLimit * (baseFee + priorityFee)
   * gasLimit = estimatedGasLimit
   * baseFee = (block.baseFeePerGas / 10^9) GWEI
   * priorityFee must be always lte to baseFee and calculated like
   * lowPriorityFee = 1 GWEI
   * averagePriorityFee = priorityFee / 2
   * highPriorityFee = priorityFee
   *
   * @param from Wallet address
   * @param to Wallet address
   * @param value coins amount
   * @param data additional data if needed
   * @returns fee data
   */
  static async estimate(
    {from, to, value = Balance.Empty, data = '0x', minGas}: TxEstimationParams,
    calculationType: EstimationVariant = EstimationVariant.average,
    provider = Provider.selectedProvider,
  ): Promise<CalculatedFees> {
    try {
      const rpcProvider = await getRpcProvider(provider);
      const {maxFeePerGas, maxPriorityFeePerGas} =
        await rpcProvider.getFeeData();
      const block = await rpcProvider.getBlock('latest');

      if (!block) {
        throw new Error(
          "Tx estimation failed: Can't get latest block in chain",
        );
      }

      if (!block.baseFeePerGas) {
        throw new Error(
          "Tx estimation failed: Can't get baseFeePerGas from latest block in chain",
        );
      }

      if (!maxFeePerGas) {
        throw new Error("Tx estimation failed: Can't get maxFeePerGas");
      }

      if (!maxPriorityFeePerGas) {
        throw new Error("Tx estimation failed: Can't get maxPriorityFeePerGas");
      }

      const gasLimit = await rpcProvider.estimateGas({
        from,
        to,
        data,
        value: value.toHex(),
      } as Deferrable<TransactionRequest>);

      const maxBaseFee = block.baseFeePerGas;

      let priorityFee = maxBaseFee;

      switch (calculationType) {
        case EstimationVariant.average:
          priorityFee = maxBaseFee.div(2);
          break;
        case EstimationVariant.low:
          priorityFee = maxBaseFee.div(20);
          break;
      }

      return {
        gasLimit: new Balance(gasLimit, provider.decimals, provider.denom).max(
          minGas,
        ),
        maxBaseFee: new Balance(maxBaseFee, provider.decimals, provider.denom),
        maxPriorityFee: new Balance(
          priorityFee,
          provider.decimals,
          provider.denom,
        ),
        expectedFee: new Balance(
          gasLimit.mul(maxBaseFee.add(priorityFee)),
          provider.decimals,
          provider.denom,
        ),
      };
    } catch (error) {
      Logger.captureException(error, 'EthNetwork.estimateTransaction error');
      throw error;
    }
  }

  private static getBalanceCacheKey = (address: string) =>
    BALANCE_CACHE_KEY + address.toLowerCase();

  async transferTransaction(
    estimate: CalculatedFees,
    transport: ProviderInterface,
    wallet: Wallet,
    to: string,
    value: Balance,
    provider = Provider.selectedProvider,
  ) {
    try {
      const transaction = await EthNetwork.populateTransaction(
        estimate,
        {
          from: wallet.address,
          to,
          value,
        },
        provider,
      );
      const signedTx = await transport.signTransaction(
        wallet.path!,
        transaction,
      );

      if (!signedTx) {
        throw new Error('signedTx not found');
      }

      return await EthNetwork.sendTransaction(signedTx, provider);
    } catch (error) {
      Logger.captureException(error, 'EthNetwork.transferTransaction', {
        value,
        walletType: wallet.type,
        from: wallet.address,
        hdPath: wallet.path ?? 'null',
        to,
      });
      throw error;
    }
  }

  static async estimateERC20Transfer(
    {
      from,
      to,
      amount,
      contractAddress,
    }: {
      from: string;
      to: string;
      amount: Balance;
      contractAddress: string;
    },
    estimationVariant: EstimationVariant = EstimationVariant.average,
    provider = Provider.selectedProvider,
  ) {
    const data = getERC20TransferData(to, amount, contractAddress);
    return await EthNetwork.estimate(
      {
        from,
        to: contractAddress,
        value: Balance.Empty,
        data,
      },
      estimationVariant,
      provider,
    );
  }

  async transferERC20(
    estimate: CalculatedFees,
    transport: ProviderInterface,
    from: Wallet,
    to: string,
    amount: Balance,
    contractAddress: string,
    provider = Provider.selectedProvider,
  ) {
    try {
      const data = getERC20TransferData(to, amount, contractAddress);
      const unsignedTx = await EthNetwork.populateTransaction(
        estimate,
        {
          from: from.address,
          to: contractAddress,
          value: Balance.Empty,
          data,
        },
        provider,
      );

      const signedTx = await transport.signTransaction(from.path!, unsignedTx);

      return await EthNetwork.sendTransaction(signedTx, provider);
    } catch (error) {
      Logger.captureException(error, 'EthNetwork.transferERC20', {
        amount,
        contractAddress,
        from: from.address,
        to,
        hdPath: from.path ?? 'null',
      });
      throw error;
    }
  }

  async transferERC721(
    estimate: CalculatedFees,
    transport: ProviderInterface,
    from: Wallet,
    to: string,
    tokenId: number,
    contractAddress: string,
    provider = Provider.selectedProvider,
  ) {
    try {
      const data = getERC721TransferData(from.address, to, tokenId);
      const unsignedTx = await EthNetwork.populateTransaction(
        estimate,
        {
          from: from.address,
          to: contractAddress,
          value: Balance.Empty,
          data,
        },
        provider,
      );

      const signedTx = await transport.signTransaction(from.path!, unsignedTx);

      return await EthNetwork.sendTransaction(signedTx, provider);
    } catch (error) {
      Logger.captureException(error, 'EthNetwork.transferERC721', {
        tokenId,
        contractAddress,
        from: from.address,
        to,
        hdPath: from.path ?? 'null',
      });
      throw error;
    }
  }

  async transferERC1155(
    estimate: CalculatedFees,
    transport: ProviderInterface,
    from: Wallet,
    to: string,
    tokenId: number,
    contractAddress: string,
    provider = Provider.selectedProvider,
  ) {
    try {
      const data = getERC1155TransferData(from.address, to, tokenId);
      const unsignedTx = await EthNetwork.populateTransaction(
        estimate,
        {
          from: from.address,
          to: contractAddress,
          value: Balance.Empty,
          data,
        },
        provider,
      );

      const signedTx = await transport.signTransaction(from.path!, unsignedTx);

      return await EthNetwork.sendTransaction(signedTx, provider);
    } catch (error) {
      Logger.captureException(error, 'EthNetwork.transferERC1155', {
        tokenId,
        contractAddress,
        from: from.address,
        to,
        hdPath: from.path ?? 'null',
      });
      throw error;
    }
  }
}
