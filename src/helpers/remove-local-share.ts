import {ITEM_KEY} from '@haqq/provider-sss-react-native/dist/constants';
import {accountInfo} from '@haqq/provider-web3-utils';
import EncryptedStorage from 'react-native-encrypted-storage';

export const removeLocalShare = async (sssPrivateKey: string) => {
  const account = await accountInfo(sssPrivateKey);
  await EncryptedStorage.removeItem(
    `${ITEM_KEY}_${account.address.toLowerCase()}`,
  );
};
