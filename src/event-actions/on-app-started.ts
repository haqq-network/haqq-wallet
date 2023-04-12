import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';
import {isAfter} from 'date-fns';
import {Linking} from 'react-native';

import {Color} from '@app/colors';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/isFeatureEnabled';
import {I18N, getText} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Refferal} from '@app/models/refferal';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {Airdrop} from '@app/services/airdrop';

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

    if (isFeatureEnabled(Feature.mpc)) {
      const mpc = await ProviderMpcReactNative.getAccounts();
      if (mnemonics.length && !mpc.length) {
        navigator.navigate('backupMpcSuggestion', {accountId: mnemonics[0]});
        return;
      }

      if (mpc.length) {
        app.emit(Events.onWalletMpcCheck, app.snoozeBackup);
      }
    }
    if (mnemonics.length) {
      app.emit(Events.onWalletMnemonicCheck, app.snoozeBackup);
    }
  }

  const refferal = Refferal.getAll().filtered('isUsed = false');

  if (refferal.length) {
    try {
      const ref = refferal[0];

      const info = await Airdrop.instance.info(ref.code);

      if (!info.available) {
        Banner.remove(ref.code);
      } else {
        Banner.create({
          id: ref.code,
          title: info.airdrop_title,
          description: info.airdrop_text,
          buttons: [
            {
              id: new Realm.BSON.UUID(),
              title: info.airdrop_button_text,
              event: 'claimCode',
              params: {
                claim_code: ref.code,
              },
              color: info.airdrop_button_text_color,
              backgroundColor: info.airdrop_button_background_color,
            },
          ],
          backgroundColorFrom: info.airdrop_button_background_color,
          backgroundColorTo: info.airdrop_button_background_color,
        });
      }
    } catch (e) {
      if (e instanceof Error) {
        showModal('error', {
          title: getText(I18N.modalRewardErrorTitle),
          description: e.message,
          close: getText(I18N.modalRewardErrorClose),
          icon: 'reward_error',
          color: Color.graphicSecond4,
        });
      }
    }
  }
}
