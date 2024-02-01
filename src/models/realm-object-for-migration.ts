import {WalletCardStyle, WalletType} from '@app/types';
import {
  CARD_DEFAULT_STYLE,
  DEFAULT_CARD_BACKGROUND,
  DEFAULT_CARD_PATTERN,
} from '@app/variables/common';

export class ContactRealmObject extends Realm.Object {
  static schema = {
    name: 'Contact',
    properties: {
      account: 'string',
      name: 'string',
      type: 'string',
      visible: 'bool',
    },
    primaryKey: 'account',
  };
}

export class TransactionRealmObject extends Realm.Object {
  static schema = {
    name: 'Transaction',
    properties: {
      hash: 'string',
      block: 'string?',
      account: 'string',
      raw: 'string',
      from: 'string',
      to: 'string?',
      contractAddress: 'string?',
      value: 'double',
      fee: 'double',
      createdAt: {type: 'date', default: () => new Date()},
      confirmed: {type: 'bool', default: false},
      providerId: 'string',
      chainId: 'string',
      feeHex: 'string',
      input: 'string',
    },
    primaryKey: 'hash',
  };
}

export class WalletRealmObject extends Realm.Object {
  static schema = {
    name: 'Wallet',
    properties: {
      address: 'string',
      name: {type: 'string', default: ''},
      data: {type: 'string', default: ''},
      mnemonicSaved: {type: 'bool', default: false},
      socialLinkEnabled: {type: 'bool', default: false},
      cardStyle: {type: 'string', default: WalletCardStyle.flat},
      isHidden: {type: 'bool', default: false},
      isMain: {type: 'bool', default: false},
      colorFrom: {type: 'string', default: DEFAULT_CARD_BACKGROUND},
      colorTo: {type: 'string', default: DEFAULT_CARD_BACKGROUND},
      colorPattern: {type: 'string', default: DEFAULT_CARD_PATTERN},
      pattern: {type: 'string', default: CARD_DEFAULT_STYLE},
      type: {type: 'string', default: WalletType.hot},
      path: 'string?',
      deviceId: 'string?',
      rootAddress: 'string?',
      subscription: 'string?',
      version: 'int',
      accountId: 'string?',
    },
    primaryKey: 'address',
  };
}
