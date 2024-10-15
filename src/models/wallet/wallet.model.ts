import tron from 'tronweb';

import {WalletType} from '@app/types';
import {ETH_COIN_TYPE, TRON_COIN_TYPE} from '@app/variables/common';

import {IWalletModel} from './wallet.types';

import {Provider} from '../provider';

export class WalletModel implements IWalletModel {
  constructor(public model: IWalletModel) {}

  /**
   * Check if the wallet is supported on Tron.
   * TODO: add support for ledger and keystone
   */
  get isSupportTron() {
    switch (this.type) {
      case WalletType.hot:
      case WalletType.sss:
      case WalletType.mnemonic:
        return true;
      case WalletType.ledgerBt:
      case WalletType.keystone:
      default:
        return false;
    }
  }

  get address() {
    if (this.isSupportTron && Provider.selectedProvider.isTron) {
      return tron.utils.address.fromHex(this.model.address);
    }
    return this.model.address;
  }

  get name() {
    return this.model.name;
  }

  get data() {
    return this.model.data;
  }

  get mnemonicSaved() {
    return this.model.mnemonicSaved;
  }

  get socialLinkEnabled() {
    return this.model.socialLinkEnabled;
  }

  get cardStyle() {
    return this.model.cardStyle;
  }

  get colorFrom() {
    return this.model.colorFrom;
  }

  get colorTo() {
    return this.model.colorTo;
  }

  get colorPattern() {
    return this.model.colorPattern;
  }

  get pattern() {
    return this.model.pattern;
  }

  get isHidden() {
    return this.model.isHidden;
  }

  get isMain() {
    return this.model.isMain;
  }

  get type() {
    return this.model.type;
  }

  get deviceId() {
    return this.model.deviceId;
  }

  get path() {
    if (this.isSupportTron && Provider.selectedProvider.isTron) {
      switch (this.type) {
        case WalletType.hot:
        case WalletType.sss:
        case WalletType.mnemonic:
          return this.model?.path?.replace(ETH_COIN_TYPE, TRON_COIN_TYPE);
        // TODO: add support for ledger and keystone
        case WalletType.ledgerBt:
        case WalletType.keystone:
        default:
          return '';
      }
    }
    return this.model.path;
  }

  get rootAddress() {
    return this.model.rootAddress;
  }

  get subscription() {
    return this.model.subscription;
  }

  get version() {
    return this.model.version;
  }

  get accountId() {
    return this.model.accountId;
  }

  get cosmosAddress() {
    return this.model.cosmosAddress;
  }

  get position() {
    return this.model.position;
  }

  get isImported() {
    return this.model.isImported;
  }
}
