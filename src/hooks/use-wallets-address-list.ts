import {useMemo} from 'react';

import {computed} from 'mobx';

import {Wallet} from '@app/models/wallet';

export const useWalletsAddressList = () => {
  return useMemo(() => computed(() => Wallet.addressList()), []).get();
};
