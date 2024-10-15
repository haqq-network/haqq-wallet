import {makeID} from '@haqq/shared-react-native';

import {DEBUG_VARS} from '@app/debug-vars';
import {AddressUtils} from '@app/helpers/address-utils';
import {WalletCardStyle, WalletType} from '@app/types';

import {WalletModel} from './wallet.types';

export const getMockWallets = (): WalletModel[] => {
  return DEBUG_VARS.mockWalletsAddresses.map((address, index) => ({
    address: AddressUtils.toEth(address),
    cosmosAddress: AddressUtils.toHaqq(address),
    accountId: makeID(6),
    data: '',
    mnemonicSaved: false,
    socialLinkEnabled: false,
    name: `🔴 DEBUG #${index}`,
    pattern: `card-rhombus-${index + 1}`,
    cardStyle: WalletCardStyle.gradient,
    colorFrom: '#2ebf41',
    colorTo: '#552ebf',
    colorPattern: '#A6A628',
    type: WalletType.hot,
    path: "44'/60'/0'/0/0",
    version: 2,
    isHidden: false,
    isMain: index === 0,
    position: index,
    subscription: null,
  }));
};
