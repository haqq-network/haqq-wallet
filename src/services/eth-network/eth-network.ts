import {TransactionRequest} from '@ethersproject/abstract-provider';
import {Deferrable} from '@ethersproject/properties';
import {ProviderInterface} from '@haqq/provider-base';
import {BigNumber, utils} from 'ethers';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {EstimationVariant} from '@app/models/fee';
import {Provider} from '@app/models/provider';
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

  static init(provider: Provider) {
    EthNetwork.chainId = provider.ethChainId;
    EthNetwork.explorer = provider.explorer;
  }

  static async populateTransaction(
    estimate: CalculatedFees,
    {from, to, value = Balance.Empty, data = '0x'}: TxEstimationParams,
  ) {
    try {
      if (!AddressUtils.isEthAddress(to)) {
        throw new Error('Invalid "from" address');
      }
      if (!AddressUtils.isEthAddress(from)) {
        throw new Error('Invalid "to" address');
      }
      const rpcProvider = await getRpcProvider(app.provider);
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
        chainId: app.provider.ethChainId,
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
        provider: app.provider.name,
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

  static async customEstimate(
    {from, to, value = Balance.Empty, data = '0x'}: TxEstimationParams,
    {gasLimit, maxBaseFee, maxPriorityFee}: TxCustomEstimationParams,
  ): Promise<CalculatedFees> {
    try {
      const rpcProvider = await getRpcProvider(app.provider);
      const block = await rpcProvider.getBlock('latest');
      const estimateGasLimit = await rpcProvider.estimateGas({
        from,
        to,
        data,
        value: value.toHex(),
      } as Deferrable<TransactionRequest>);

      let resultGasLimit = gasLimit;
      if (resultGasLimit.lt(estimateGasLimit)) {
        resultGasLimit = estimateGasLimit;
      }

      let resultMaxBaseFee = maxBaseFee;
      if (resultMaxBaseFee.lt(block.baseFeePerGas!)) {
        resultMaxBaseFee = block.baseFeePerGas!;
      }

      return {
        gasLimit: new Balance(resultGasLimit),
        maxBaseFee: new Balance(resultMaxBaseFee),
        maxPriorityFee: new Balance(maxPriorityFee),
        expectedFee: new Balance(
          resultGasLimit.mul(resultMaxBaseFee.add(maxPriorityFee)),
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
   * @param data aditional data if needed
   * @returns fee data
   */
  static async estimate(
    {from, to, value = Balance.Empty, data = '0x', minGas}: TxEstimationParams,
    calculationType: EstimationVariant = EstimationVariant.average,
  ): Promise<CalculatedFees> {
    try {
      const rpcProvider = await getRpcProvider(app.provider);
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
        gasLimit: new Balance(gasLimit).max(minGas),
        maxBaseFee: new Balance(maxBaseFee),
        maxPriorityFee: new Balance(priorityFee),
        expectedFee: new Balance(gasLimit.mul(maxBaseFee.add(priorityFee))),
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
  ) {
    try {
      const transaction = await EthNetwork.populateTransaction(estimate, {
        from: wallet.address,
        to,
        value,
      });
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
    );
  }

  async transferERC20(
    estimate: CalculatedFees,
    transport: ProviderInterface,
    from: Wallet,
    to: string,
    amount: Balance,
    contractAddress: string,
  ) {
    try {
      const data = getERC20TransferData(to, amount, contractAddress);
      const unsignedTx = await EthNetwork.populateTransaction(estimate, {
        from: from.address,
        to: contractAddress,
        value: Balance.Empty,
        data,
      });

      const signedTx = await transport.signTransaction(from.path!, unsignedTx);

      return await EthNetwork.sendTransaction(signedTx);
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

  static async estimateERC721Transfer(
    from: string,
    to: string,
    tokenId: number,
    contractAddress: string,
  ) {
    const data = getERC721TransferData(from, to, tokenId);
    return await EthNetwork.estimate({
      from,
      to: contractAddress,
      value: Balance.Empty,
      data,
    });
  }

  async transferERC721(
    estimate: CalculatedFees,
    transport: ProviderInterface,
    from: Wallet,
    to: string,
    tokenId: number,
    contractAddress: string,
  ) {
    try {
      const data = getERC721TransferData(from.address, to, tokenId);
      const unsignedTx = await EthNetwork.populateTransaction(estimate, {
        from: from.address,
        to: contractAddress,
        value: Balance.Empty,
        data,
      });

      const signedTx = await transport.signTransaction(from.path!, unsignedTx);

      return await EthNetwork.sendTransaction(signedTx);
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

  static async estimateERC1155Transfer(
    from: string,
    to: string,
    tokenId: number,
    contractAddress: string,
  ) {
    const data = getERC1155TransferData(from, to, tokenId);
    return await EthNetwork.estimate({
      from,
      to: contractAddress,
      value: Balance.Empty,
      data,
    });
  }

  async transferERC1155(
    estimate: CalculatedFees,
    transport: ProviderInterface,
    from: Wallet,
    to: string,
    tokenId: number,
    contractAddress: string,
  ) {
    try {
      const data = getERC1155TransferData(from.address, to, tokenId);
      const unsignedTx = await EthNetwork.populateTransaction(estimate, {
        from: from.address,
        to: contractAddress,
        value: Balance.Empty,
        data,
      });

      const signedTx = await transport.signTransaction(from.path!, unsignedTx);

      return await EthNetwork.sendTransaction(signedTx);
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
