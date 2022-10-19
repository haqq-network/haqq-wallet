import {getChainId, getDefaultNetwork} from '../network';
import {Deferrable} from '@ethersproject/properties';
import {TransactionRequest} from '@ethersproject/abstract-provider';
import {BigNumber, utils} from 'ethers';
import {UnsignedTransaction} from '@ethersproject/transactions/src.ts';

export class EthNetwork {
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

    const baseTx = {
      chainId: tx.chainId || undefined,
      data: tx.data || undefined,
      gasLimit: tx.gasLimit || undefined,
      type: 2,
      maxFeePerGas: tx.maxFeePerGas || undefined,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas || undefined,
      nonce: tx.nonce ? BigNumber.from(tx.nonce).toNumber() : undefined,
      to: tx.to || undefined,
      value: tx.value || undefined,
    };

    const unsignedTx = utils.serializeTransaction(baseTx).substring(2);

    return {
      transaction,
      unsignedTx,
    };
  }

  static serializeTransaction(
    from: string,
    transaction: UnsignedTransaction,
    signature: {
      s: string;
      v: string;
      r: string;
    },
  ) {
    return utils.serializeTransaction(transaction, {
      ...signature,
      r: '0x' + signature.r,
      s: '0x' + signature.s,
      v: parseInt(signature.v),
      from,
    });
  }
}
