import {TransactionDescription as ITransactionDescription} from '@ethersproject/abi';
import {ethers} from 'ethers';

import {IconsName} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {Contracts} from '@app/models/contracts';
import {Balance} from '@app/services/balance';
import {
  IContract,
  IndexerTransaction,
  IndexerTransactionWithType,
  IndexerTxMsgEthereumTx,
  IndexerTxMsgType,
  IndexerTxParsedTokenInfo,
} from '@app/types';
import {ERC20_TOKEN_ABI} from '@app/variables/abi';
import {CURRENCY_NAME, WEI_PRECISION} from '@app/variables/common';

import {AddressUtils} from './address-utils';
import {shortAddress} from './short-address';

export type TransactionDescription = ITransactionDescription;

/**
 *  @returns {Balance[]} - array of balances, if array length greater than 1, it's a multi token cosmos IBC tx
 */
function getAmount(tx: IndexerTransaction): Balance[] {
  if (!tx?.msg?.type) {
    return [Balance.Empty];
  }

  const msg = tx.msg;

  const tokensInfo = getTokensInfo(tx);

  if (
    tokensInfo.length === 1 &&
    'amount' in msg &&
    !Array.isArray(msg.amount)
  ) {
    const token = tokensInfo[0];
    if (isErc20TransferTx(tx)) {
      const erc20InputDataJson = getErc20InputDataJson(tx);
      return [
        new Balance(
          // BigNumber
          erc20InputDataJson?.args?.[1] || tx.msg.amount,
          token.decimals,
          token.symbol,
        ),
      ];
    }

    if (msg && 'amount' in msg) {
      if (typeof msg.amount === 'string') {
        return [new Balance(msg.amount, token.decimals, token.symbol)];
      }

      if (typeof msg.amount === 'object') {
        return [new Balance(msg.amount.amount, token.decimals, token.symbol)];
      }
    }
  } else if ('amount' in msg && Array.isArray(msg.amount)) {
    return msg.amount.map(amount => {
      const contract = Contracts.getById(amount.contract_address!);
      if (contract && contract.is_erc20) {
        return new Balance(
          amount.amount,
          contract.decimals || 0,
          contract.symbol || 'ibc',
        );
      }
      return new Balance(amount.amount, 0, 'ibc');
    });
  }

  return [Balance.Empty];
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
    const erc20InputDataJson = getErc20InputDataJson(tx);

    if (erc20InputDataJson?.name === 'transfer') {
      return false;
    }

    return true;
  }

  return false;
}

function getIconName(tx: IndexerTransaction, addresses: string[]): IconsName {
  if (!tx?.msg?.type) {
    return IconsName.question;
  }

  if (tx.msg.type === IndexerTxMsgType.msgUndelegate) {
    return IconsName.staking_undelegation;
  }
  if (tx.msg.type === IndexerTxMsgType.msgDelegate) {
    return IconsName.staking_delegation;
  }
  if (tx.msg.type === IndexerTxMsgType.msgBeginRedelegate) {
    return IconsName.staking_redelegation;
  }
  if (tx.msg.type === IndexerTxMsgType.msgEthereumRaffleTx) {
    return IconsName.raffle_reward;
  }
  if (tx.msg.type === IndexerTxMsgType.msgWithdrawDelegatorReward) {
    return IconsName.staking_reword;
  }

  if (isContractInteraction(tx) && !isErc20TransferTx(tx)) {
    return IconsName.contract;
  }

  if (isIncomingTx(tx, addresses)) {
    return IconsName.arrow_receive;
  }

  if (isOutcomingTx(tx, addresses)) {
    return IconsName.arrow_send;
  }

  return IconsName.question;
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

function getTokensInfo(tx: IndexerTransaction): IndexerTxParsedTokenInfo[] {
  const defaultTokenInfo = {
    name: getText(I18N.transactionConfirmationIslamicCoin),
    symbol: CURRENCY_NAME,
    icon: require('@assets/images/islm_icon.png'),
    decimals: WEI_PRECISION,
    contract_address: '',
    denom: CURRENCY_NAME,
  };
  if (!tx?.msg?.type) {
    return [defaultTokenInfo];
  }

  if ('amount' in tx.msg && Array.isArray(tx.msg.amount)) {
    const result = tx.msg.amount
      .map(amount => {
        if (amount.contract_address) {
          const contract = Contracts.getById(amount.contract_address);
          if (contract && contract.is_erc20) {
            return {
              name: contract.name,
              symbol: contract.symbol,
              icon: contract.icon
                ? {uri: contract.icon}
                : require('@assets/images/empty-icon.png'),
              decimals: contract.decimals || WEI_PRECISION,
              contract_address:
                // @ts-ignore
                amount.contract_address || tx.msg.contract_address,
              denom: amount.denom,
            };
          }
        }
        return undefined;
      })
      .filter(t => !!t?.name) as IndexerTxParsedTokenInfo[];

    if (result.length) {
      return result;
    }
  }

  let contractInfo: IContract | undefined;

  if (
    'amount' in tx.msg &&
    tx?.msg?.amount &&
    'amount' in tx?.msg?.amount &&
    tx.msg.amount.contract_address
  ) {
    contractInfo = Contracts.getById(tx.msg.amount.contract_address);
  }

  if ('contract_address' in tx.msg && !contractInfo) {
    contractInfo = Contracts.getById(tx.msg.contract_address);
  }

  if ('to_address' in tx.msg && !contractInfo) {
    contractInfo = Contracts.getById(tx.msg.to_address);
  }

  if ('from_address' in tx.msg && !contractInfo) {
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
        symbol: contractInfo.symbol,
        icon: contractInfo.icon
          ? {uri: contractInfo.icon}
          : require('@assets/images/empty-icon.png'),
        decimals: contractInfo?.decimals || WEI_PRECISION,
        // @ts-ignore
        denom: tx?.msg?.amount?.denom,
        contract_address: contractInfo.id,
      },
    ];
  }

  return [defaultTokenInfo];
}

function getErc20InputDataJson(
  tx: IndexerTransaction,
): TransactionDescription | undefined {
  try {
    if (tx.input) {
      const erc20Interface = new ethers.utils.Interface(ERC20_TOKEN_ABI);
      return erc20Interface.parseTransaction({data: tx.input});
    }
  } catch (e) {}
  return undefined;
}

function isErc20TransferTx(
  tx: IndexerTransaction,
): tx is IndexerTransactionWithType<IndexerTxMsgType.msgEthereumErc20TransferTx> {
  try {
    if (tx.msg.type === IndexerTxMsgType.msgEthereumErc20TransferTx) {
      return true;
    }

    const erc20InputDataJson = getErc20InputDataJson(tx);
    if (erc20InputDataJson) {
      const amountBn = erc20InputDataJson.args?.[1];
      return erc20InputDataJson.name === 'transfer' && amountBn;
    }
  } catch (e) {}
  return false;
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
  getTokensInfo,
  getErc20InputDataJson,
  isErc20TransferTx,
};
