import React from 'react';

import {StyleProp, ViewStyle} from 'react-native';

import {Wallet} from '@app/models/wallet';

import {WalletRowVariant1} from './wallet-row-variant-1';
import {WalletRowVariant2} from './wallet-row-variant-2';

export enum WalletRowTypes {
  variant1,
  variant2,
}

export type WalletRowProps = {
  item: Wallet;
  style?: StyleProp<ViewStyle>;
  onPress?: (address: string) => void;
  hideArrow?: boolean;
  checked?: boolean;
  type?: WalletRowTypes;
};

export const WalletRow = ({
  type = WalletRowTypes.variant1,
  ...props
}: WalletRowProps) => {
  if (!props?.item) {
    return null;
  }

  switch (type) {
    case WalletRowTypes.variant2:
      return <WalletRowVariant2 {...props} />;
    case WalletRowTypes.variant1:
    default:
      return <WalletRowVariant1 {...props} />;
  }
};
