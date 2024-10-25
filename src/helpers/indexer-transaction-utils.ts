import {IconsName} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {ParsedTransactionData, Transaction} from '@app/models/transaction';
import {Balance} from '@app/services/balance';
import {
  IToken,
  IndexerTransaction,
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
      case IndexerTxMsgType.msgProtoTx:
        return parseTransferContractTx(tx as any, addresses);
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

function parseTransferContractTx(
  tx: IndexerTransactionWithType<IndexerTxMsgType.msgProtoTx>,
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
  format: 'toEth' | 'toHaqq' | 'toTron' = 'toEth',
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

  let amountKey = 'amount';
  if (tx.msg.type === IndexerTxMsgType.msgProtoTx) {
    amountKey = 'transferContract';
  }
  //@ts-ignore
  const amountValue = tx.msg[amountKey];

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
  if ('ownerAddress' in tx.msg && !contractInfo?.is_erc20) {
    contractInfo = Token.getById(tx.msg.ownerAddress as string);
  }

  if ('to_address' in tx.msg && !contractInfo?.is_erc20) {
    contractInfo = Token.getById(tx.msg.to_address);
  }
  if ('toAddress' in tx.msg && !contractInfo?.is_erc20) {
    contractInfo = Token.getById(tx.msg.toAddress as string);
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
