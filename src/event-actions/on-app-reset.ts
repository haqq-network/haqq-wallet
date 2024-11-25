import RNAsyncStorage from '@react-native-async-storage/async-storage';
import BlastedImage from 'react-native-blasted-image';
import EncryptedStorage from 'react-native-encrypted-storage';
import {resetGenericPassword} from 'react-native-keychain';
import RNRestart from 'react-native-restart';

import {app} from '@app/contexts';
import {cleanGoogle} from '@app/helpers/get-google-tokens';
import {Contact} from '@app/models/contact';
import {Transaction} from '@app/models/transaction';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {WalletConnectSessionMetadata} from '@app/models/wallet-connect-session-metadata';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {WC_PAIRING_URLS_KEY} from '@app/services/wallet-connect';
import {sleep} from '@app/utils';

export async function onAppReset() {
  try {
    BlastedImage.clearAllCaches();
    Wallet.removeAll();
    Contact.removeAll();
    Transaction.removeAll();
    Web3BrowserSession.removeAll();
    Web3BrowserBookmark.removeAll();
    Web3BrowserSearchHistory.removeAll();
    WalletConnectSessionMetadata.removeAll();
    VariablesString.remove(WC_PAIRING_URLS_KEY);
    VariablesString.remove('rootMnemonicAccountId');
    const uid = await EncryptedStorage.getItem('uid');

    try {
      const asyncStorageKeys = await RNAsyncStorage.getAllKeys();
      for (let key of asyncStorageKeys) {
        await RNAsyncStorage.removeItem(key);
        await sleep(100);
      }
    } catch (err) {
      Logger.captureException(err, 'onAppReset: RNAsyncStorage.clear()');
    }

    await resetGenericPassword();
    await EncryptedStorage.clear();
    if (uid) {
      await EncryptedStorage.setItem('uid', uid);
    }
    app.getUser().resetUserData();
    cleanGoogle();
  } catch (err) {
    Logger.captureException(err, 'onAppReset');
  } finally {
    app.onboarded = false;
    RNRestart.restart();
  }
}
