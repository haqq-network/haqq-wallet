import RNAsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {resetGenericPassword} from 'react-native-keychain';

import {app} from '@app/contexts';
import {Contact} from '@app/models/contact';
import {Transaction} from '@app/models/transaction';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {WalletConnectSessionMetadata} from '@app/models/wallet-connect-session-metadata';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {WalletConnect} from '@app/services/wallet-connect';

export async function onAppReset() {
  const uid = await EncryptedStorage.getItem('uid');
  await EncryptedStorage.clear();
  Transaction.removeAll();
  Wallet.removeAll();
  Web3BrowserBookmark.removeAll();
  Web3BrowserSearchHistory.removeAll();
  Web3BrowserSession.removeAll();
  Contact.removeAll();

  const wcSessions = WalletConnectSessionMetadata.getAll();
  if (wcSessions?.length) {
    await Promise.all(
      wcSessions.map(({topic}) =>
        WalletConnect.instance.disconnectSession(topic),
      ),
    );
  }
  WalletConnectSessionMetadata.removeAll();

  const asyncStorageKeys = await RNAsyncStorage.getAllKeys();
  if (asyncStorageKeys.length > 0) {
    if (Platform.OS === 'android') {
      await RNAsyncStorage.clear();
    }
    if (Platform.OS === 'ios') {
      await RNAsyncStorage.multiRemove(asyncStorageKeys);
    }
  }

  app.getUser().resetUserData();
  VariablesString.set('rootMnemonicAccountId', '');
  await resetGenericPassword();

  if (uid) {
    await EncryptedStorage.setItem('uid', uid);
  }
  app.onboarded = false;
}
