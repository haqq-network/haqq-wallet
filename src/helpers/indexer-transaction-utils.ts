import {IconsName} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {Contracts} from '@app/models/contracts';
import {Balance} from '@app/services/balance';
import {
  IndexerTransaction,
  IndexerTxMsgEthereumTx,
  IndexerTxMsgType,
  IndexerTxParsedTokenInfo,
} from '@app/types';
import {CURRENCY_NAME, WEI_PRECISION} from '@app/variables/common';

import {AddressUtils} from './address-utils';
import {shortAddress} from './short-address';

function getAmount(tx: IndexerTransaction): Balance {
  if (!tx?.msg?.type) {
    return Balance.Empty;
  }

  const msg = tx.msg;

  switch (msg.type) {
    // amount is IndexerCoin[]
    case IndexerTxMsgType.msgSend:
      return msg?.amount?.reduce((prev, curr) => {
        return prev.operate(new Balance(curr.amount), 'add');
      }, Balance.Empty);
    // amount is IndexerCoin
    case IndexerTxMsgType.msgBeginRedelegate:
    case IndexerTxMsgType.msgDelegate:
    case IndexerTxMsgType.msgUndelegate:
      if (typeof msg.amount === 'string') {
        return new Balance(msg.amount);
      }
      return new Balance(msg.amount?.amount || '0');
    // amount is string
    case IndexerTxMsgType.msgEthereumTx:
    case IndexerTxMsgType.msgEthereumRaffleTx:
      return new Balance(msg.amount);
    case IndexerTxMsgType.msgEthereumErc20TransferTx:
      const contractInfo = Contracts.getById(msg.contract_address);
      return new Balance(
        msg.amount,
        contractInfo?.decimals || WEI_PRECISION,
        contractInfo?.symbol || CURRENCY_NAME,
      );
    default:
      return Balance.Empty;
  }
}

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

function isOutcomingTx(tx: IndexerTransaction, addresses: string[]): boolean {
  if (!tx?.msg?.type) {
    return false;
  }

  const msg = tx.msg;
  const haqqAddresses = addresses.map(AddressUtils.toHaqq);

  if ('from_address' in msg) {
    return haqqAddresses.includes(AddressUtils.toHaqq(msg.from_address));
  }

  if (
    'delegator_address' in msg &&
    haqqAddresses.includes(msg.delegator_address)
  ) {
    return msg.type === IndexerTxMsgType.msgDelegate;
  }

  return false;
}

function isContractInteraction(
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

function getIconName(tx: IndexerTransaction, addresses: string[]): IconsName {
  if (tx?.msg?.type === IndexerTxMsgType.msgEthereumRaffleTx) {
    return IconsName.star_fill;
  }

  if (isContractInteraction(tx)) {
    return IconsName.contract;
  }

  if (isIncomingTx(tx, addresses)) {
    return IconsName.arrow_receive;
  }

  if (isOutcomingTx(tx, addresses)) {
    return IconsName.arrow_send;
  }

  return IconsName.color_flat;
}

function getContractName(tx: IndexerTransaction): string {
  if (!tx?.msg?.type) {
    return '';
  }

  const msg = tx.msg;
  if ('contract_address' in msg) {
    const contract = Contracts.getById(msg.contract_address);
    return contract?.name || '';
  }

  if ('to_address' in msg) {
    const contract = Contracts.getById(msg.to_address);
    return contract?.name || '';
  }

  if ('from_address' in msg) {
    const contract = Contracts.getById(msg.from_address as string);
    return contract?.name || '';
  }

  return '';
}

function getDescription(
  tx: IndexerTransaction,
  addresses: string[],
): {
  title: string;
  subtitle: string;
} {
  if (!tx?.msg?.type) {
    return {title: '', subtitle: ''};
  }

  const msg = tx.msg;

  if (msg?.type === IndexerTxMsgType.msgEthereumRaffleTx) {
    return {
      title: 'Raffle reward',
      subtitle: `from ${shortAddress(
        AddressUtils.toEth(msg.contract_address),
        '•',
      )}`,
    };
  }

  if (msg.type === IndexerTxMsgType.msgUndelegate) {
    const {from} = getFromAndTo(tx, addresses);
    return {
      title: 'Undelegation',
      subtitle: `from ${shortAddress(AddressUtils.toEth(from), '•')}`,
    };
  }
  if (msg.type === IndexerTxMsgType.msgDelegate) {
    const {to} = getFromAndTo(tx, addresses);
    return {
      title: 'Delegation',
      subtitle: `to ${shortAddress(AddressUtils.toEth(to), '•')}`,
    };
  }
  if (msg.type === IndexerTxMsgType.msgWithdrawDelegatorReward) {
    const {to} = getFromAndTo(tx, addresses);
    return {
      title: 'Staking reward',
      subtitle: `to ${shortAddress(AddressUtils.toEth(to), '•')}`,
    };
  }

  if (isContractInteraction(tx)) {
    return {
      title: getText(I18N.transactionContractTitle),
      subtitle:
        getContractName(tx) || getText(I18N.transactionContractDefaultName),
    };
  }

  if (isIncomingTx(tx, addresses)) {
    const {from} = getFromAndTo(tx, addresses);
    return {
      title: getText(I18N.transactionReceiveTitle),
      subtitle: `from ${shortAddress(AddressUtils.toEth(from), '•')}`,
    };
  }

  if (isOutcomingTx(tx, addresses)) {
    const {to} = getFromAndTo(tx, addresses);
    return {
      title: getText(I18N.transactionSendTitle),
      subtitle: `to ${shortAddress(AddressUtils.toEth(to), '•')}`,
    };
  }

  return {title: 'Unknown', subtitle: msg.type};
}

function getFromAndTo(tx: IndexerTransaction, addresses: string[]) {
  if (isIncomingTx(tx, addresses)) {
    // @ts-ignore
    const from = tx.msg.from_address || tx.msg.validator_address;
    // @ts-ignore
    const to = tx.msg.to_address || tx.msg.winner || tx.msg.delegator_address;

    return {
      from: from ? AddressUtils.toEth(from) : '',
      to: to ? AddressUtils.toEth(to) : '',
    };
  }

  if (isOutcomingTx(tx, addresses)) {
    // @ts-ignore
    const to = tx.msg.from_address || tx.msg.validator_address;
    // @ts-ignore
    const from = tx.msg.to_address || tx.msg.winner || tx.msg.delegator_address;

    return {
      from: from ? AddressUtils.toEth(from) : '',
      to: to ? AddressUtils.toEth(to) : '',
    };
  }

  return {
    from: '',
    to: '',
  };
}

function isEthereumTx(tx: IndexerTransaction) {
  const txHash = tx?.hash;
  if (!txHash) {
    return false;
  }

  return txHash.startsWith('0x') || txHash.startsWith('0X');
}

function isCosmosTx(tx: IndexerTransaction) {
  const txHash = tx?.hash;
  if (!txHash) {
    return false;
  }
  return !isEthereumTx(tx);
}

function getTokenInfo(tx: IndexerTransaction): IndexerTxParsedTokenInfo {
  const defaultTokenInfo = {
    name: getText(I18N.transactionConfirmationIslamicCoin),
    symbol: CURRENCY_NAME,
    icon: require('@assets/images/islm_icon.png'),
    decimals: WEI_PRECISION,
  };
  if (!tx?.msg?.type) {
    return defaultTokenInfo;
  }

  if (tx.msg.type === IndexerTxMsgType.msgEthereumErc20TransferTx) {
    const contractInfo =
      Contracts.getById(tx.msg.contract_address) ||
      Contracts.getById(tx.msg.to_address) ||
      Contracts.getById(tx.msg.from_address);

    if (contractInfo) {
      return {
        name: contractInfo?.name || '-',
        symbol: contractInfo?.symbol || '-',
        icon: contractInfo?.icon
          ? {uri: addRawToGithubUrl(contractInfo.icon)}
          : require('@assets/images/empty-icon.png'),
        decimals: contractInfo?.decimals || WEI_PRECISION,
      };
    }
  }

  return defaultTokenInfo;
}

// TODO: REMOVE THIS FUNCTION
function addRawToGithubUrl(url: string): string {
  const githubDomain = 'github.com';
  const rawSuffix = '?raw=true';
  if (url.includes(githubDomain) && !url.includes(rawSuffix)) {
    return url + rawSuffix;
  }
  return url;
}

export const IndexerTransactionUtils = {
  getAmount,
  isIncomingTx,
  isOutcomingTx,
  isContractInteraction,
  getIconName,
  getDescription,
  getContractName,
  getFromAndTo,
  isCosmosTx,
  isEthereumTx,
  getTokenInfo,
};
