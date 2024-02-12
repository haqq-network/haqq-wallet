import {Wallet} from '@app/models/wallet';

export const useWalletsAddressList = () => {
  return Wallet.addressList();
};
