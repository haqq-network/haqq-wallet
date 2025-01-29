import React from 'react';

import {StyleProp, ViewStyle} from 'react-native';

import {Provider} from '@app/models/provider';
import {WalletModel} from '@app/models/wallet';
import {ChainId} from '@app/types';

import {WalletRowVariant1} from './wallet-row-variant-1';
import {WalletRowVariant2} from './wallet-row-variant-2';
import {WalletRowVariant3} from './wallet-row-variant-3';
import {WalletRowVariant4} from './wallet-row-variant-4';
import {WalletRowVariant5} from './wallet-row-variant-5';

export enum WalletRowTypes {
  variant1,
  variant2,
  variant3,
  variant4,
  variant5,
}

export type WalletRowProps = {
  item: WalletModel;
  style?: StyleProp<ViewStyle>;
  onPress?: (address: string) => void;
  hideArrow?: boolean;
  checked?: boolean;
  disabled?: boolean;
  type?: WalletRowTypes;
  hideBalance?: boolean;
  chainId?: ChainId;
};

export const WalletRow = ({
  type = WalletRowTypes.variant1,
  chainId = Provider.selectedProvider.ethChainId,
  ...props
}: WalletRowProps) => {
  if (!props?.item) {
    return null;
  }

  switch (type) {
    case WalletRowTypes.variant5:
      return <WalletRowVariant5 {...props} chainId={chainId} />;
    case WalletRowTypes.variant4:
      return <WalletRowVariant4 {...props} chainId={chainId} />;
    case WalletRowTypes.variant3:
      return <WalletRowVariant3 {...props} chainId={chainId} />;
    case WalletRowTypes.variant2:
      return <WalletRowVariant2 {...props} chainId={chainId} />;
    case WalletRowTypes.variant1:
    default:
      return <WalletRowVariant1 {...props} chainId={chainId} />;
  }
};
