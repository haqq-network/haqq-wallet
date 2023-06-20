import RNAsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import {resetGenericPassword} from 'react-native-keychain';

import {app} from '@app/contexts';
import {Contact} from '@app/models/contact';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';

export async function onAppReset() {
  const uid = await EncryptedStorage.getItem('uid');
  //TODO: save session
  await EncryptedStorage.clear();
  Transaction.removeAll();
  await Wallet.removeAll();
  Contact.removeAll();
  const keys = await RNAsyncStorage.getAllKeys();
  for (const key of keys) {
    await RNAsyncStorage.removeItem(key);
  }
  await app.getUser().resetUserData();
  await resetGenericPassword();

  if (uid) {
    await EncryptedStorage.setItem('uid', uid);
  }
}
