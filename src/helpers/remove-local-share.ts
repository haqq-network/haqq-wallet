import {accountInfo} from '@haqq/provider-web3-utils';
import {constants} from '@haqq/rn-wallet-providers';
import EncryptedStorage from 'react-native-encrypted-storage';

export const removeLocalShare = async (sssPrivateKey: string) => {
  const account = await accountInfo(sssPrivateKey);
  await EncryptedStorage.removeItem(
    `${
      constants.ITEM_KEYS[constants.WalletType.sss]
    }_${account.address.toLowerCase()}`,
  );
};
