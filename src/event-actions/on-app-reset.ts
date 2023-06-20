import RNAsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import {resetGenericPassword} from 'react-native-keychain';

import {app} from '@app/contexts';
import {Contact} from '@app/models/contact';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';

export async function onAppReset() {
  const uid = await EncryptedStorage.getItem('uid');
  //TODO: save session
  await EncryptedStorage.clear();
  Transaction.removeAll();
  await Wallet.removeAll();
  Web3BrowserBookmark.removeAll();
  Web3BrowserSearchHistory.removeAll();
  Web3BrowserSession.removeAll();
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
