import {ITEM_KEY} from '@haqq/provider-sss-react-native/dist/constants';
import {accountInfo} from '@haqq/provider-web3-utils';
import {decryptShare} from '@haqq/shared-react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

export const decryptLocalShare = async (
  sssPrivateKey: string,
  password: string,
) => {
  const account = await accountInfo(sssPrivateKey);
  const _value = await EncryptedStorage.getItem(
    `${ITEM_KEY}_${account.address.toLowerCase()}`,
  );
  const shareStore = await decryptShare(JSON.parse(_value || ''), password);

  return JSON.stringify(shareStore);
};
