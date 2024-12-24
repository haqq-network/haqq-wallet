import {makeAutoObservable} from 'mobx';

import {AddressUtils} from '@app/helpers/address-utils';
import {ChainId, WalletType} from '@app/types';
import {ETH_COIN_TYPE, TRON_COIN_TYPE} from '@app/variables/common';

import {IWalletModel} from './wallet.types';

import {Provider} from '../provider';

export class WalletModel implements IWalletModel {
  constructor(public model: IWalletModel) {
    makeAutoObservable(this);
  }

  /**
   * Check if the wallet is supported on Tron.
   * TODO: add support for ledger and keystone
   */
  get isSupportTron() {
    switch (this.type) {
      case WalletType.mnemonic:
      case WalletType.sss:
      case WalletType.hot:
      case WalletType.watchOnly:
        return true;
      case WalletType.ledgerBt:
      case WalletType.keystone:
      default:
        return false;
    }
  }

  get address() {
    return AddressUtils.toEth(this.model.address);
  }

  get cosmosAddress() {
    return AddressUtils.toHaqq(this.model.cosmosAddress);
  }

  get tronAddress() {
    return AddressUtils.toTron(this.model.tronAddress);
  }

  get providerSpecificAddress() {
    if (Provider.selectedProvider.isTron) {
      return this.tronAddress;
    }
    return this.address;
  }

  getAddressByProviderChainId = (chainId: ChainId) => {
    const provider = Provider.getByEthChainId(chainId);
    if (provider?.isTron) {
      return this.tronAddress;
    }
    if (provider?.isHaqqNetwork) {
      return this.cosmosAddress;
    }
    return this.address;
  };

  get name() {
    if (!this.model.name) {
      return 'Unknown';
    }
    return this.model.name.replaceAll('&nbsp;', ' ');
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

  // FIXME: Remove it when fully moved to getPath method
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

  getPath(provider = Provider.selectedProvider) {
    if (this.isSupportTron && provider.isTron) {
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

  get position() {
    return this.model.position;
  }

  get isImported() {
    return this.model.isImported;
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this.model)) as IWalletModel;
  }
}
