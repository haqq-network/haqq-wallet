import {IconsName} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {ParsedTransactionData, Transaction} from '@app/models/transaction';
import {Balance} from '@app/services/balance';
import {
  ChainId,
  IToken,
  IndexerProtoMsgTxType,
  IndexerTransaction,
  IndexerTransactionParticipantRole,
  IndexerTransactionWithType,
  IndexerTxMsgEthereumTx,
  IndexerTxMsgType,
  IndexerTxParsedTokenInfo,
} from '@app/types';
import {IBC_DENOM} from '@app/variables/common';

import {AddressUtils} from './address-utils';
import {shortAddress} from './short-address';

const getNativeToken = (
  provider = Provider.selectedProvider,
): IndexerTxParsedTokenInfo => {
  return {
    name: provider.isHaqqNetwork
      ? getText(I18N.transactionConfirmationIslamicCoin)
      : provider.name,
    symbol: provider.denom,
    icon: provider.isHaqqNetwork
      ? require('@assets/images/islm_icon.png')
      : {uri: provider.icon},
    decimals: provider.decimals,
    contract_address: '',
  };
};

export function parseTransaction(
  tx: IndexerTransaction,
  addressesMap: Record<ChainId, string[]>,
): Transaction {
  const addresses = addressesMap[tx.chain_id];
  const parse = () => {
    switch (tx.msg.type) {
      case IndexerTxMsgType.msgEthereumRaffleTx:
        return parseMsgEthereumRaffleTx(tx as any, addresses);
      case IndexerTxMsgType.msgWithdrawDelegatorReward:
        return parseMsgWithdrawDelegatorReward(tx as any, addresses);
      case IndexerTxMsgType.msgDelegate:
        return parseMsgDelegate(tx as any, addresses);
      case IndexerTxMsgType.msgUndelegate:
        return parseMsgUndelegate(tx as any, addresses);
      case IndexerTxMsgType.msgEthereumTx:
        return parseMsgEthereumTx(tx as any, addresses);
      case IndexerTxMsgType.msgEthereumErc20TransferTx:
        return parseMsgEthereumErc20TransferTx(tx as any, addresses);
      case IndexerTxMsgType.msgSend:
        return parseMsgSend(tx as any, addresses);
      case IndexerTxMsgType.msgBeginRedelegate:
        return parseMsgBeginRedelegate(tx as any, addresses);
      case IndexerTxMsgType.msgEthereumApprovalTx:
        return parseMsgEthereumApprovalTx(tx as any, addresses);
      case IndexerTxMsgType.msgProtoTx:
        return parseMsgProtoTx(tx as any, addresses);
      case IndexerTxMsgType.msgEventTx:
        return parseMsgEventTx(tx as any, addresses);
      // TODO: implement other tx types
      case IndexerTxMsgType.unknown:
      case IndexerTxMsgType.msgVote:
      case IndexerTxMsgType.msgWithdrawValidatorCommission:
      case IndexerTxMsgType.msgEthereumNftTransferTx:
      case IndexerTxMsgType.msgEthereumNftMintTx:
      case IndexerTxMsgType.msgConvertIntoVestingAccount:
      case IndexerTxMsgType.msgUnjail:
      case IndexerTxMsgType.msgCreateValidator:
      case IndexerTxMsgType.msgEditValidator:
      default:
        return undefined;
    }
  };

  return {
    ...tx,
    parsed: parse(),
  } as Transaction;
}

function parseMsgBeginRedelegate(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgBeginRedelegate>,
  _: string[],
): ParsedTransactionData {
  const isIncoming = false;
  const provider = Provider.getByEthChainId(tx.chain_id);
  const amount = [
    new Balance(tx.msg.amount.amount, provider?.decimals, provider?.denom),
  ];

  return {
    from: AddressUtils.toEth(tx.msg.delegator_address),
    to: tx.msg.validator_dst_address,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken(provider)],
    isCosmosTx: true,
    isEthereumTx: false,
    icon: IconsName.staking_redelegation,
    title: getText(I18N.transactionRedelegationTitle),
    subtitle: formatAddressForSubtitle(
      tx.msg.validator_src_address,
      'toHaqq',
      false,
    ),
  };
}

function parseMsgEthereumApprovalTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgEthereumApprovalTx>,
  _: string[],
): ParsedTransactionData {
  const [token] = getTokensInfo(tx);
  const amount = [new Balance(tx.msg.amount, token.decimals, token.symbol)];
  const spenderContract = Token.getById(AddressUtils.toHaqq(tx.msg.spender));

  return {
    from: AddressUtils.toEth(tx.msg.owner),
    to: AddressUtils.toEth(tx.msg.contract_address),
    amount,
    isContractInteraction: true,
    isIncoming: false,
    isOutcoming: false,
    tokens: [token],
    isCosmosTx: false,
    isEthereumTx: true,
    icon: IconsName.check,
    title: getText(I18N.transactionApproveERC20Title),
    subtitle:
      spenderContract?.name ||
      formatAddressForSubtitle(tx.msg.spender, 'toEth', false),
  };
}

function parseMsgEventTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgEventTx>,
  addresses: string[],
): ParsedTransactionData | undefined {
  switch (tx.msg.messageType) {
    case 'transfer':
      return parseTransferEventTx(tx as any, addresses); // send TRC20 token
    default:
      return undefined;
  }
}

/**
 * Example transaction:
  {
    "block": 49017942,
    "chain_id": 2494104990,
    "code": 1,
    "confirmations": 0,
    "fee": "0",
    "gas_limit": "13045",
    "hash": "0x5f57e6021d9a4f1697351a23b50cd43a21ceceac0bf5582c1a2791d287f0f8a6",
    "id": "0x5f57e6021d9a4f1697351a23b50cd43a21ceceac0bf5582c1a2791d287f0f8a6",
    "input": "a9059cbb000000000000000000000000f066ec5164b6e38cdcab8daa957c21fa9759215f00000000000000000000000000000000000000000000000000000000006acfc0",
    "msg": {
      "blockId": "49017942",
      "contractAddress": "tsNLx+A6DVJvQ4XupCQNOze0B28=",
      "data": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABqz8A=",
      "message": {
        "transfer": {
          "from": "HXFYEQKwQWNOYkegpTJgRW07eFw=",
          "to": "8GbsUWS244zcq42qlXwh+pdZIV8=",
          "value": "NzAwMDAwMA=="
        }
      },
      "messageType": "transfer",
      "topic0": "3fJSrRviyJtpwrBo/DeNqpUrp/FjxKEWKPVaTfUjs+8=",
      "topic1": "AAAAAAAAAAAAAAAAHXFYEQKwQWNOYkegpTJgRW07eFw=",
      "topic2": "AAAAAAAAAAAAAAAA8GbsUWS244zcq42qlXwh+pdZIV8=",
      "txId": "X1fmAh2aTxaXNRojtQzUOiHOzqwL9VgsGieR0ofw+KY=",
      "type": "msgEventTx"
    },
    "msg_type": "TriggerSmartContract",
    "participants": [
      {
        "address": "HXFYEQKwQWNOYkegpTJgRW07eFw=",
        "blockId": "49017942",
        "role": "sender",
        "txId": "X1fmAh2aTxaXNRojtQzUOiHOzqwL9VgsGieR0ofw+KY="
      },
      {
        "address": "8GbsUWS244zcq42qlXwh+pdZIV8=",
        "blockId": "49017942",
        "role": "receiver",
        "txId": "X1fmAh2aTxaXNRojtQzUOiHOzqwL9VgsGieR0ofw+KY="
      }
    ],
    "senders": [],
    "ts": "2024-11-04T13:07:09Z"
  }
 */
function parseTransferEventTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgEventTx>,
  addresses: string[],
): ParsedTransactionData | undefined {
  if (!tx.msg.message.transfer) {
    return undefined;
  }
  const contractAddress = AddressUtils.tronToHex(
    AddressUtils.bufferToTron(tx.msg.contractAddress),
  );
  const token = Token.data[contractAddress] ?? Token.UNKNOWN_TOKEN;
  const from = AddressUtils.bufferToTron(tx.msg.message.transfer.from);
  const to = AddressUtils.bufferToTron(tx.msg.message.transfer.to);

  let amountString = '';

  // is base64 encoded
  if (tx?.msg?.message?.transfer?.value?.endsWith('=')) {
    amountString = AddressUtils.fromBuffer(tx.msg.message.transfer.value);
  } else {
    amountString = tx.msg.message.transfer.value;
  }

  const isIncoming = addresses.includes(to) && !addresses.includes(from);

  const title = isIncoming
    ? getText(I18N.transactionReceiveTitle)
    : getText(I18N.transactionSendTitle);

  const subtitle = isIncoming
    ? formatAddressForSubtitle(from, 'hexToTron', true)
    : formatAddressForSubtitle(to, 'hexToTron', false);

  const amount = [new Balance(amountString, token.decimals!, token.symbol!)];

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [
      {
        name: token.name!,
        symbol: token.symbol!,
        icon: token.image!,
        decimals: token.decimals!,
        contract_address: contractAddress,
      },
    ],
    isCosmosTx: false,
    isEthereumTx: true,
    icon: isIncoming ? IconsName.arrow_receive : IconsName.arrow_send,
    title,
    subtitle,
  };
}

function parseMsgProtoTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgProtoTx>,
  addresses: string[],
): ParsedTransactionData | undefined {
  switch (tx.msg_type) {
    case IndexerProtoMsgTxType.transferContract:
      return parseTransferContractTx(tx as any, addresses); // send TRX
    case IndexerProtoMsgTxType.triggerSmartContract:
      return parseTriggerSmartContractTx(tx as any, addresses); // call contract (contract interaction)
    default:
      return undefined;
  }
}

/**
 * Example transaction:
 * {
 *   "block": 49017942,
 *   "chain_id": 2494104990,
 *   "code": -1,
 *   "confirmations": 0,
 *   "fee": "0",
 *   "gas_limit": "13045",
 *   "hash": "0x5f57e6021d9a4f1697351a23b50cd43a21ceceac0bf5582c1a2791d287f0f8a6",
 *   "id": "0x5f57e6021d9a4f1697351a23b50cd43a21ceceac0bf5582c1a2791d287f0f8a6",
 *   "input": "a9059cbb000000000000000000000000f066ec5164b6e38cdcab8daa957c21fa9759215f00000000000000000000000000000000000000000000000000000000006acfc0",
 *   "msg": {
 *     "triggerSmartContract": {
 *       "contractAddress": "tsNLx+A6DVJvQ4XupCQNOze0B28=",
 *       "data": "qQWcuwAAAAAAAAAAAAAAAPBm7FFktuOM3KuNqpV8IfqXWSFfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABqz8A=",
 *       "ownerAddress": "HXFYEQKwQWNOYkegpTJgRW07eFw="
 *     },
 *     "type": "msgProtoTx"
 *   },
 *   "msg_type": "TriggerSmartContract",
 *   "participants": [
 *     {
 *       "address": "HXFYEQKwQWNOYkegpTJgRW07eFw=",
 *       "blockId": "49017942",
 *       "role": "sender",
 *       "txId": "X1fmAh2aTxaXNRojtQzUOiHOzqwL9VgsGieR0ofw+KY="
 *     },
 *     {
 *       "address": "tsNLx+A6DVJvQ4XupCQNOze0B28=",
 *       "blockId": "49017942",
 *       "role": "receiver",
 *       "txId": "X1fmAh2aTxaXNRojtQzUOiHOzqwL9VgsGieR0ofw+KY="
 *     }
 *   ],
 *   "senders": [],
 *   "ts": "2024-11-04T13:07:09Z"
 * }
 */
function parseTriggerSmartContractTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgProtoTx>,
  _addresses: string[],
): ParsedTransactionData | undefined {
  if (!tx.msg.triggerSmartContract) {
    return undefined;
  }

  const contractAddress = AddressUtils.tronToHex(
    AddressUtils.bufferToTron(tx.msg.triggerSmartContract.contractAddress),
  );

  const senderParticipant = tx.participants.find(
    p => p.role === IndexerTransactionParticipantRole.sender,
  );
  const receiverParticipant = tx.participants.find(
    p => p.role === IndexerTransactionParticipantRole.receiver,
  );

  const from = senderParticipant
    ? AddressUtils.bufferToTron(senderParticipant.address)
    : '';
  const to = receiverParticipant
    ? AddressUtils.bufferToTron(receiverParticipant.address)
    : '';

  const provider = Provider.getByEthChainId(tx.chain_id);
  const token = Token.data[contractAddress];

  // Обработка данных контракта
  const parsedToken: IndexerTxParsedTokenInfo = token
    ? {
        icon: token.image!,
        decimals: token.decimals!,
        name: token.name!,
        symbol: token.symbol!,
        contract_address: contractAddress,
      }
    : getNativeToken(provider);

  return {
    from,
    to,
    amount: [Balance.Empty],
    isContractInteraction: true,
    isIncoming: false,
    isOutcoming: true,
    tokens: [parsedToken],
    isCosmosTx: false,
    isEthereumTx: true,
    icon: IconsName.contract,
    title: getText(I18N.transactionContractTitle),
    subtitle:
      token.name ??
      getText(I18N.transactionContractDefaultName).replace(
        'HAQQ Network',
        provider?.name!,
      ),
  };
}

/**
 * Example transaction:
 * {
 *   "block": 49017933,
 *   "chain_id": 2494104990,
 *   "code": -1,
 *   "confirmations": 0,
 *   "fee": "0",
 *   "gas_limit": "0",
 *   "hash": "0xf6371d0a49d088e524fea7444763eecf414ff2a0c225d677f5be0c005d9318d4",
 *   "id": "0xf6371d0a49d088e524fea7444763eecf414ff2a0c225d677f5be0c005d9318d4",
 *   "input": "",
 *   "msg": {
 *     "transferContract": {
 *       "amount": "5000000",
 *       "ownerAddress": "HXFYEQKwQWNOYkegpTJgRW07eFw=",
 *       "toAddress": "8GbsUWS244zcq42qlXwh+pdZIV8="
 *     },
 *     "type": "msgProtoTx"
 *   },
 *   "msg_type": "TransferContract",
 *   "participants": [
 *     {
 *       "address": "HXFYEQKwQWNOYkegpTJgRW07eFw=",
 *       "blockId": "49017933",
 *       "role": "sender",
 *       "txId": "9jcdCknQiOUk/qdER2Puz0FP8qDCJdZ39b4MAF2TGNQ="
 *     },
 *     {
 *       "address": "8GbsUWS244zcq42qlXwh+pdZIV8=",
 *       "blockId": "49017933",
 *       "role": "receiver",
 *       "txId": "9jcdCknQiOUk/qdER2Puz0FP8qDCJdZ39b4MAF2TGNQ="
 *     }
 *   ],
 *   "senders": [],
 *   "ts": "2024-11-04T13:06:42Z"
 * }
 */
function parseTransferContractTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgProtoTx>,
  addresses: string[],
): ParsedTransactionData | undefined {
  if (!tx.msg.transferContract) {
    return undefined;
  }

  const senderParticipant = tx.participants.find(
    p => p.role === IndexerTransactionParticipantRole.sender,
  );
  const receiverParticipant = tx.participants.find(
    p => p.role === IndexerTransactionParticipantRole.receiver,
  );

  const from = senderParticipant
    ? AddressUtils.bufferToTron(senderParticipant.address)
    : '';
  const to = receiverParticipant
    ? AddressUtils.bufferToTron(receiverParticipant.address)
    : '';

  const isIncoming = addresses.includes(to) && !addresses.includes(from);

  const provider = Provider.getByEthChainId(tx.chain_id);
  const amount = [
    new Balance(
      tx.msg.transferContract.amount,
      provider?.decimals,
      provider?.denom,
    ),
  ];

  const title = isIncoming
    ? getText(I18N.transactionReceiveTitle)
    : getText(I18N.transactionSendTitle);

  const subtitle = isIncoming
    ? formatAddressForSubtitle(from, 'hexToTron', true)
    : formatAddressForSubtitle(to, 'hexToTron', false);

  const icon = isIncoming ? IconsName.arrow_receive : IconsName.arrow_send;

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken(provider)],
    isCosmosTx: false,
    isEthereumTx: true,
    icon: icon,
    title,
    subtitle: subtitle,
  };
}

function parseMsgEthereumRaffleTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgEthereumRaffleTx>,
  addresses: string[],
): ParsedTransactionData {
  const isIncoming = isIncomingTx(tx, addresses);
  const {from, to} = getFromAndTo(tx, isIncoming);
  const provider = Provider.getByEthChainId(tx.chain_id);
  const amount = [
    new Balance(tx.msg.amount.amount, provider?.decimals, provider?.denom),
  ];

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken(provider)],
    isCosmosTx: false,
    isEthereumTx: true,
    icon: IconsName.raffle_reward,
    title: getText(I18N.transactionRaffleRewardTitle),
    subtitle: formatAddressForSubtitle(from, 'toEth', true),
  };
}

function parseMsgWithdrawDelegatorReward(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgWithdrawDelegatorReward>,
  addresses: string[],
): ParsedTransactionData {
  const isIncoming = isIncomingTx(tx, addresses);
  const {from, to} = getFromAndTo(tx, isIncoming);
  // for delegation reward tx amount is empty
  const provider = Provider.getByEthChainId(tx.chain_id);
  const amount = [
    new Balance(Balance.Empty, provider?.decimals, provider?.denom),
  ];

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken(provider)],
    isCosmosTx: true,
    isEthereumTx: false,
    icon: IconsName.staking_reword,
    title: getText(I18N.transactioStakingRewardTitle),
    subtitle: formatAddressForSubtitle(from, 'toHaqq', true),
  };
}

function parseMsgDelegate(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgDelegate>,
  _: string[],
): ParsedTransactionData {
  const isIncoming = false;
  const {from, to} = getFromAndTo(tx, isIncoming);
  const provider = Provider.getByEthChainId(tx.chain_id);
  const amount = [
    new Balance(tx.msg.amount.amount, provider?.decimals, provider?.denom),
  ];

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken(provider)],
    isCosmosTx: true,
    isEthereumTx: true,
    icon: IconsName.staking_delegation,
    title: getText(I18N.transactionDelegationTitle),
    subtitle: formatAddressForSubtitle(from, 'toHaqq', true),
  };
}

function parseMsgUndelegate(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgUndelegate>,
  _: string[],
): ParsedTransactionData {
  const isIncoming = true;
  const {from, to} = getFromAndTo(tx, isIncoming);
  const provider = Provider.getByEthChainId(tx.chain_id);
  const amount = [
    new Balance(tx.msg.amount.amount, provider?.decimals, provider?.denom),
  ];

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken(provider)],
    isCosmosTx: true,
    isEthereumTx: false,
    icon: IconsName.staking_undelegation,
    title: getText(I18N.transactionUndelegationTitle),
    subtitle: formatAddressForSubtitle(to, 'toHaqq', false),
  };
}

function parseMsgEthereumTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgEthereumTx>,
  addresses: string[],
): ParsedTransactionData {
  const isIncoming = isIncomingTx(tx, addresses);
  const {from, to} = getFromAndTo(tx, isIncoming);
  const provider = Provider.getByEthChainId(tx.chain_id);
  const amount = [
    new Balance(tx.msg.amount.amount, provider?.decimals, provider?.denom),
  ];

  const title = isIncoming
    ? getText(I18N.transactionReceiveTitle)
    : getText(I18N.transactionSendTitle);

  const subtitle = isIncoming
    ? formatAddressForSubtitle(from, 'toEth', true)
    : formatAddressForSubtitle(to, 'toEth', false);
  const icon = isIncoming ? IconsName.arrow_receive : IconsName.arrow_send;

  const isContractInteraction = isContractInteractionTx(tx);

  return {
    from,
    to,
    amount,
    isContractInteraction,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken(provider)],
    isCosmosTx: false,
    isEthereumTx: true,
    icon: isContractInteraction ? IconsName.contract : icon,
    title: isContractInteraction
      ? getText(I18N.transactionContractTitle)
      : title,
    subtitle: isContractInteraction ? getContractName(tx) : subtitle,
  };
}

function parseMsgEthereumErc20TransferTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgEthereumErc20TransferTx>,
  addresses: string[],
): ParsedTransactionData {
  const isIncoming = isIncomingTx(tx, addresses);
  const {from, to} = getFromAndTo(tx, isIncoming);
  const [token] = getTokensInfo(tx);
  const amount = [
    new Balance(tx.msg.amount.amount, token.decimals, token.symbol),
  ];

  const title = isIncoming
    ? getText(I18N.transactionReceiveTitle)
    : getText(I18N.transactionSendTitle);
  const subtitle = isIncoming
    ? formatAddressForSubtitle(from, 'toEth', true)
    : formatAddressForSubtitle(to, 'toEth', false);
  const icon = isIncoming ? IconsName.arrow_receive : IconsName.arrow_send;

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [token],
    isCosmosTx: false,
    isEthereumTx: true,
    icon,
    title,
    subtitle,
  };
}

// IBC transfer
function parseMsgSend(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgSend>,
  addresses: string[],
): ParsedTransactionData {
  const isIncoming = isIncomingTx(tx, addresses);
  const {from, to} = getFromAndTo(tx, isIncoming);

  const title = isIncoming
    ? getText(I18N.transactionReceiveTitle)
    : getText(I18N.transactionSendTitle);
  const subtitle = isIncoming
    ? formatAddressForSubtitle(from, 'toEth', true)
    : formatAddressForSubtitle(to, 'toEth', false);
  const icon = isIncoming ? IconsName.arrow_receive : IconsName.arrow_send;

  const tokens = getTokensInfo(tx);
  const amount = tx?.msg?.amount?.map(a => {
    const provider = Provider.getByEthChainId(tx.chain_id);
    const contract = Token.getById(
      a.contract_address! || tx.msg.contract_address,
    );
    if (contract?.is_erc20) {
      return new Balance(
        a.amount,
        contract.decimals ?? provider?.decimals,
        contract.symbol ?? provider?.denom,
      );
    }

    const decimals =
      a.denom === Provider.selectedProvider.weiDenom
        ? Provider.selectedProvider.decimals
        : 0;
    const symbol =
      a.denom === Provider.selectedProvider.weiDenom
        ? Provider.selectedProvider.denom
        : a.denom || IBC_DENOM;
    return new Balance(a.amount, decimals, symbol);
  });

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens,
    isCosmosTx: true,
    isEthereumTx: false,
    icon,
    title,
    subtitle,
  };
}

/**
 *  UTILS FUNCTIONS
 **/

const formatAddressForSubtitle = (
  address: string,
  format: 'toEth' | 'toHaqq' | 'toTron' | 'hexToTron' = 'toEth',
  from = false,
) =>
  `${from ? 'from' : 'to'} ${shortAddress(AddressUtils[format](address), '•')}`;

function isIncomingTx(tx: IndexerTransaction, addresses: string[]): boolean {
  if (!tx?.msg?.type) {
    return false;
  }

  const msg = tx.msg;
  const haqqAddresses = addresses.map(AddressUtils.toHaqq);

  if ('to_address' in msg) {
    return haqqAddresses.includes(AddressUtils.toHaqq(msg.to_address));
  }

  if (msg.type === IndexerTxMsgType.msgProtoTx) {
    const tronAddresses = addresses.map(AddressUtils.toTron);
    if (msg.transferContract?.toAddress) {
      return tronAddresses.includes(msg.transferContract.toAddress);
    }
    if (msg.triggerSmartContract?.ownerAddress) {
      return tronAddresses.includes(msg.triggerSmartContract.ownerAddress);
    }
    return false;
  }

  if ('winner' in msg) {
    return haqqAddresses.includes(AddressUtils.toHaqq(msg.winner));
  }

  if (
    'delegator_address' in msg &&
    haqqAddresses.includes(msg.delegator_address)
  ) {
    return (
      msg.type === IndexerTxMsgType.msgUndelegate ||
      msg.type === IndexerTxMsgType.msgWithdrawDelegatorReward
    );
  }

  return false;
}

function isContractInteractionTx(
  tx: IndexerTransaction,
): tx is Omit<IndexerTransaction, 'msg'> & {msg: IndexerTxMsgEthereumTx} {
  if (!tx?.msg?.type) {
    return false;
  }

  if (
    tx.msg.type === IndexerTxMsgType.msgEthereumTx &&
    tx.input !== '0x' &&
    !/^0x0+$/.test(tx.input)
  ) {
    return true;
  }

  return false;
}

function getContractName(tx: IndexerTransaction): string {
  const defaultContractName = getText(I18N.transactionContractDefaultName);
  if (!tx?.msg?.type) {
    return defaultContractName;
  }

  const msg = tx.msg;
  let name = '';

  if ('contract_address' in msg) {
    const contract = Token.getById(msg.contract_address);
    name = contract?.name!;
  }

  if ('to_address' in msg && !name) {
    const contract = Token.getById(msg.to_address);
    name = contract?.name!;
  }

  if ('from_address' in msg && !name) {
    const contract = Token.getById(msg.from_address as string);
    name = contract?.name!;
  }

  return name || defaultContractName;
}

function getTokensInfo(tx: IndexerTransaction): IndexerTxParsedTokenInfo[] {
  if (!tx?.msg?.type) {
    return [Token.UNKNOWN_TOKEN];
  }

  //@ts-ignore
  const amountValue = tx.msg?.amount;

  if (amountValue && Array.isArray(amountValue)) {
    const result = amountValue
      // @ts-ignore
      .map(amount => getTokensInfo({...tx, msg: {...tx.msg, amount}}))
      .flat();

    if (result.length) {
      return result;
    }
  }

  const provider = Provider.getByEthChainId(tx.chain_id);
  if (amountValue?.denom === provider?.weiDenom) {
    return [getNativeToken(provider)];
  }

  let contractInfo: IToken | undefined;

  if (
    amountValue &&
    typeof amountValue === 'object' &&
    'amount' in amountValue &&
    amountValue.contract_address
  ) {
    contractInfo = Token.getById(amountValue.contract_address);
  }

  if ('contract_address' in tx.msg && !contractInfo?.is_erc20) {
    contractInfo = Token.getById(tx.msg.contract_address);
  }

  if ('to_address' in tx.msg && !contractInfo?.is_erc20) {
    contractInfo = Token.getById(tx.msg.to_address);
  }

  if ('from_address' in tx.msg && !contractInfo?.is_erc20) {
    contractInfo = Token.getById(tx.msg.from_address);
  }

  if (
    contractInfo &&
    contractInfo.is_erc20 &&
    contractInfo.symbol &&
    contractInfo.name
  ) {
    return [
      {
        name: contractInfo.name,
        symbol: amountValue?.denom || contractInfo.symbol,
        icon: contractInfo.image ?? require('@assets/images/empty-icon.png'),
        decimals: contractInfo?.decimals || Provider.selectedProvider.decimals,
        contract_address: contractInfo.id,
      },
    ];
  }

  return [Token.UNKNOWN_TOKEN];
}

function getFromAndTo(tx: IndexerTransaction, isIncoming: boolean) {
  if (isIncoming) {
    if (tx?.msg?.type === IndexerTxMsgType.msgProtoTx) {
      const from = tx.participants.find(
        p => p.role === IndexerTransactionParticipantRole.sender,
      )?.address;
      const to = tx.participants.find(
        p => p.role === IndexerTransactionParticipantRole.receiver,
      )?.address;
      return {
        from: from ? AddressUtils.bufferToTron(from) : '',
        to: to ? AddressUtils.bufferToTron(to) : '',
      };
    }

    const from =
      // @ts-ignore
      tx.msg.from_address ||
      // @ts-ignore
      tx.msg.validator_address ||
      // @ts-ignore
      tx.msg.contract_address;
    // @ts-ignore
    const to = tx.msg.to_address || tx.msg.winner || tx.msg.delegator_address;

    return {
      from: from ? AddressUtils.toEth(from) : '',
      to: to ? AddressUtils.toEth(to) : '',
    };
  }

  // @ts-ignore
  const to = tx.msg.to_address || tx.msg.validator_address;
  const from =
    // @ts-ignore
    tx.msg.from_address || tx.msg.winner || tx.msg.delegator_address;

  return {
    from: from ? AddressUtils.toEth(from) : '',
    to: to ? AddressUtils.toEth(to) : '',
  };
}
