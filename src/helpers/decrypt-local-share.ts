import {accountInfo} from '@haqq/provider-web3-utils';
import {constants} from '@haqq/rn-wallet-providers';
import {decryptShare} from '@haqq/shared-react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

export const decryptLocalShare = async (
  sssPrivateKey: string,
  password: string,
  // optional address to decrypt share for specific address when sssPrivateKey does not contain address
  address?: string,
) => {
  try {
    const account = await accountInfo(sssPrivateKey);
    const _value = await EncryptedStorage.getItem(
      `${
        constants.ITEM_KEYS[constants.WalletType.sss]
      }_${account.address.toLowerCase()}`,
    );
    const shareStore = await decryptShare(JSON.parse(_value || ''), password);

    return JSON.stringify(shareStore);
  } catch (error) {
    // fallback to decrypt share for specific address
    if (address) {
      const _value = await EncryptedStorage.getItem(
        `${
          constants.ITEM_KEYS[constants.WalletType.sss]
        }_${address.toLowerCase()}`,
      );
      const shareStore = await decryptShare(JSON.parse(_value || ''), password);

      return JSON.stringify(shareStore);
    }
    return null;
  }
};
