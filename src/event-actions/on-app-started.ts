import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {isAfter} from 'date-fns';
import {Linking} from 'react-native';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {ProviderMpcReactNative} from '@app/services/provider-mpc';

export async function onAppStarted() {
  const initialUrl = await Linking.getInitialURL();

  if (initialUrl && initialUrl.startsWith('haqq:')) {
    app.emit(Events.onDeepLink, initialUrl);
  }

  const wallets = Wallet.getAllVisible();

  await Promise.all(
    wallets.map(wallet => {
      return new Promise(resolve => {
        app.emit(Events.onTransactionsLoad, wallet.address, resolve);
      });
    }),
  );

  if (isAfter(new Date(), app.snoozeBackup)) {
    const mnemonics = await ProviderMnemonicReactNative.getAccounts();
    const mpc = await ProviderMpcReactNative.getAccounts();

    if (mnemonics.length && !mpc.length) {
      navigator.navigate('backupMpcSuggestion', {accountId: mnemonics[0]});
      return;
    }

    if (mpc.length) {
      app.emit(Events.onWalletMpcCheck, app.snoozeBackup);
    }

    if (mnemonics.length) {
      app.emit(Events.onWalletMnemonicCheck, app.snoozeBackup);
    }
  }
}
