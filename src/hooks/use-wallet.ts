import {useMemo} from 'react';

import {computed} from 'mobx';

import {AddressUtils} from '@app/helpers/address-utils';
import {Wallet} from '@app/models/wallet';

export const useWallet = (address: string) => {
  return useMemo(
    () =>
      computed(() => {
        if (!address) {
          return null;
        }
        return Wallet.getById(AddressUtils.toEth(address));
      }),
    [address],
  ).get();
};
