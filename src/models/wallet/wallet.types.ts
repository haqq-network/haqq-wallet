import {AddressCosmos, WalletCardStyle, WalletType} from '@app/types';

export interface IWalletModel {
  address: string;
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
  cosmosAddress: AddressCosmos;
  position: number;
  isImported?: boolean;
}
