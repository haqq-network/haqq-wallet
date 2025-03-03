import {ethers} from 'ethers';

import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {TransactionRpc} from '@app/services/rpc/evm-transaction';
import {
  IndexerTransactionStatus,
  IndexerTransactionWithType,
  IndexerTxMsgType,
} from '@app/types';
import {ERC20_ABI} from '@app/variables/abi';

export function indexerTransactionMock(tx: TransactionRpc) {
  // try to parse as a ERC20 contract call

  if (tx.input) {
    let data = tx.input;
    if (!data.startsWith('0x')) {
      data = `0x${data}`;
    }
    try {
      const parsed = new ethers.utils.Interface(ERC20_ABI).parseTransaction({
        data,
      });

      const token = Token.getById(tx.to);

      return {
        forWallet: tx.forWallet,
        block: +tx.blockNumber,
        chain_id: Provider.selectedProvider.ethChainId.toString(),
        code:
          tx.isError === '0'
            ? IndexerTransactionStatus.success
            : IndexerTransactionStatus.failed,
        fee: +tx.gasPrice,
        gas_limit: +tx.gasUsed,
        hash: tx.hash,
        input: tx.input,
        ts: new Date(+tx.timeStamp * 1000).toISOString(),
        id: tx.hash,
        confirmations: +tx.confirmations,
        msg_type: IndexerTxMsgType.msgEthereumTx,
        msg: {
          type: IndexerTxMsgType.msgEthereumErc20TransferTx,
          contract_address: tx.to,
          from_address: tx.from,
          to_address: parsed.args[0],
          amount: {
            amount: parsed.args[1].toString(),
            denom: token?.symbol || '(?)',
          },
        },
        participants: [],
      } as IndexerTransactionWithType<IndexerTxMsgType.msgEthereumErc20TransferTx>;
    } catch (e) {}
  }

  return {
    forWallet: tx.forWallet,
    block: +tx.blockNumber,
    chain_id: Provider.selectedProvider.ethChainId.toString(),
    code:
      tx.isError === '0'
        ? IndexerTransactionStatus.success
        : IndexerTransactionStatus.failed,
    fee: +tx.gasPrice,
    gas_limit: +tx.gasUsed,
    hash: tx.hash,
    input: tx.input,
    ts: new Date(+tx.timeStamp * 1000).toISOString(),
    id: tx.hash,
    confirmations: +tx.confirmations,
    msg_type: IndexerTxMsgType.msgEthereumTx,
    msg: {
      type: IndexerTxMsgType.msgEthereumTx,
      from_address: tx.from,
      to_address: tx.to,
      amount: {
        amount: tx.value,
        denom: Provider.selectedProvider.denom,
      },
    },
    participants: [],
  } as IndexerTransactionWithType<IndexerTxMsgType.msgEthereumTx>;
}
