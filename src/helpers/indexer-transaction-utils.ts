import {IconsName} from '@app/components/ui';
import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {Contracts} from '@app/models/contracts';
import {ParsedTransactionData, Transaction} from '@app/models/transaction';
import {Balance} from '@app/services/balance';
import {
  IContract,
  IndexerTransaction,
  IndexerTransactionWithType,
  IndexerTxMsgEthereumTx,
  IndexerTxMsgType,
  IndexerTxParsedTokenInfo,
} from '@app/types';
import {IBC_DENOM} from '@app/variables/common';

import {AddressUtils} from './address-utils';
import {shortAddress} from './short-address';

const getNativeToken = (): IndexerTxParsedTokenInfo => {
  return {
    name: app.provider.isHaqqNetwork
      ? getText(I18N.transactionConfirmationIslamicCoin)
      : app.provider.name,
    symbol: app.provider.denom,
    icon: app.provider.isHaqqNetwork
      ? require('@assets/images/islm_icon.png')
      : {uri: app.provider.icon},
    decimals: app.provider.decimals,
    contract_address: '',
  };
};

const UNKNOW_NTOKEN = {
  name: 'UNKNOWN',
  symbol: '?',
  icon: require('@assets/images/empty-icon.png'),
  decimals: 0,
  contract_address: '',
};

export function parseTransaction(
  tx: IndexerTransaction,
  addresses: string[],
): Transaction {
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
  const amount = [new Balance(tx.msg.amount.amount)];

  return {
    from: AddressUtils.toEth(tx.msg.delegator_address),
    to: tx.msg.validator_dst_address,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken()],
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
  const spenderContract = Contracts.getById(
    AddressUtils.toHaqq(tx.msg.spender),
  );

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

function parseMsgEthereumRaffleTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgEthereumRaffleTx>,
  addresses: string[],
): ParsedTransactionData {
  const isIncoming = isIncomingTx(tx, addresses);
  const {from, to} = getFromAndTo(tx, isIncoming);
  const amount = [new Balance(tx.msg.amount.amount)];

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken()],
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
  const amount = [Balance.Empty];

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken()],
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
  const amount = [new Balance(tx.msg.amount.amount)];

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken()],
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
  const amount = [new Balance(tx.msg.amount.amount)];

  return {
    from,
    to,
    amount,
    isContractInteraction: false,
    isIncoming,
    isOutcoming: !isIncoming,
    tokens: [getNativeToken()],
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
  const amount = [new Balance(tx.msg.amount.amount)];

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
    tokens: [getNativeToken()],
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
    const contract = Contracts.getById(
      a.contract_address! || tx.msg.contract_address,
    );
    if (contract && contract.is_erc20) {
      return new Balance(
        a.amount,
        contract.decimals || 0,
        contract.symbol || IBC_DENOM,
      );
    }

    const decimals =
      a.denom === app.provider.weiDenom ? app.provider.decimals : 0;
    const symbol =
      a.denom === app.provider.weiDenom
        ? app.provider.denom
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
  format: 'toEth' | 'toHaqq' = 'toEth',
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
    const contract = Contracts.getById(msg.contract_address);
    name = contract?.name!;
  }

  if ('to_address' in msg && !name) {
    const contract = Contracts.getById(msg.to_address);
    name = contract?.name!;
  }

  if ('from_address' in msg && !name) {
    const contract = Contracts.getById(msg.from_address as string);
    name = contract?.name!;
  }

  return name || defaultContractName;
}

function getTokensInfo(tx: IndexerTransaction): IndexerTxParsedTokenInfo[] {
  if (!tx?.msg?.type) {
    return [UNKNOW_NTOKEN];
  }

  if ('amount' in tx.msg && Array.isArray(tx.msg.amount)) {
    const result = tx.msg.amount
      // @ts-ignore
      .map(amount => getTokensInfo({...tx, msg: {...tx.msg, amount}}))
      .flat();

    if (result.length) {
      return result;
    }
  }

  // @ts-ignore
  if (tx.msg?.amount?.denom === app.provider.weiDenom) {
    return [getNativeToken()];
  }

  let contractInfo: IContract | undefined;

  if (
    'amount' in tx.msg &&
    typeof tx?.msg?.amount === 'object' &&
    tx?.msg?.amount &&
    'amount' in tx?.msg?.amount &&
    tx.msg.amount.contract_address
  ) {
    contractInfo = Contracts.getById(tx.msg.amount.contract_address);
  }

  if ('contract_address' in tx.msg && !contractInfo?.is_erc20) {
    contractInfo = Contracts.getById(tx.msg.contract_address);
  }

  if ('to_address' in tx.msg && !contractInfo?.is_erc20) {
    contractInfo = Contracts.getById(tx.msg.to_address);
  }

  if ('from_address' in tx.msg && !contractInfo?.is_erc20) {
    contractInfo = Contracts.getById(tx.msg.from_address);
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
        // @ts-ignore
        symbol: tx?.msg?.amount?.denom || contractInfo.symbol,
        icon: contractInfo.icon
          ? {uri: contractInfo.icon}
          : require('@assets/images/empty-icon.png'),
        decimals: contractInfo?.decimals || app.provider.decimals,
        contract_address: contractInfo.id,
      },
    ];
  }

  return [UNKNOW_NTOKEN];
}

function getFromAndTo(tx: IndexerTransaction, isIncoming: boolean) {
  if (isIncoming) {
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
