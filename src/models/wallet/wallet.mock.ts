import {DEBUG_VARS} from '@app/debug-vars';
import {AddressUtils} from '@app/helpers/address-utils';
import {makeID} from '@app/utils';

import {WalletModel} from './wallet.model';

import {WalletCardStyle, WalletType} from '../../types';

const getMockWallets = (): WalletModel[] =>
  DEBUG_VARS.mockWalletsAddresses.map(
    (address, index) =>
      new WalletModel({
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
      }),
  );

const isMockEnabled =
  __DEV__ &&
  DEBUG_VARS.enableMockWallets &&
  DEBUG_VARS.mockWalletsAddresses.length;

let originalWallets: WalletModel[] = [];

export const deserialize = (value: WalletModel[]) => {
  if (isMockEnabled) {
    originalWallets = value;
    return getMockWallets();
  }

  return value
    .map(wallet =>
      wallet instanceof WalletModel ? wallet : new WalletModel(wallet),
    )
    .sort((a: WalletModel, b: WalletModel) => a.position - b.position);
};

export const serialize = (value: WalletModel[]) => {
  if (isMockEnabled) {
    return originalWallets;
  }
  return value;
};
