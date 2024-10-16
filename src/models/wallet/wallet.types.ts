import {
  AddressCosmosHaqq,
  AddressEthereum,
  WalletCardStyle,
  WalletType,
} from '@app/types';

import {BalanceModel} from './balance.model';

export interface IWalletModel {
  address: AddressEthereum;
  name: string;
  data: string;
  mnemonicSaved: boolean;
  socialLinkEnabled: boolean;
  cardStyle: WalletCardStyle;
  colorFrom: string;
  colorTo: string;
  colorPattern: string;
  pattern: string;
  isHidden: boolean;
  isMain: boolean;
  type: WalletType;
  deviceId?: string;
  path?: string;
  rootAddress?: string;
  subscription: string | null;
  version: number;
  accountId: string | null;
  cosmosAddress: AddressCosmosHaqq;
  position: number;
  isImported?: boolean;
}

export type WalletBalance = Record<AddressEthereum, BalanceModel>;
