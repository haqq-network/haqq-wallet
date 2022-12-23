import {TransactionRequest} from '@ethersproject/abstract-provider';
import {FeeData} from '@ethersproject/abstract-provider/src.ts';
import {Deferrable} from '@ethersproject/properties';
import {BigNumber, BigNumberish, ethers, utils} from 'ethers';

import {calcFeeWei} from '@app/helpers';

import {Provider} from '../models/provider';
import {getDefaultChainId, getDefaultNetwork} from '../network';
import {TransportWallet} from '../types';
import {WEI} from '../variables/common';

export class EthNetwork {
  static network: ethers.providers.StaticJsonRpcProvider = getDefaultNetwork();
  static chainId: number = getDefaultChainId();
  static explorer: string | undefined;
  public stop = false;

  async sendTransaction(
    transport: TransportWallet,
    to: string,
    amount: string | number,
  ) {
    const transaction = await EthNetwork.populateTransaction(
      transport.getEthAddress(),
      to,
      String(amount),
    );

    const signedTx = await transport.getSignedTx(transaction);

    if (!signedTx) {
      throw new Error('signedTx not found');
    }

    const response = await EthNetwork.network.sendTransaction(signedTx);

    return response;
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
    EthNetwork.chainId = provider.ethChainId;
    EthNetwork.explorer = provider.explorer;
    EthNetwork.network = provider.rpcProvider;
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
    const result = await Promise.all([
      EthNetwork.network.getFeeData(),
      EthNetwork.network.estimateGas({
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
}
