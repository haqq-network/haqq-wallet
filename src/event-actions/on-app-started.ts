import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';
import {isAfter} from 'date-fns';
import {Linking} from 'react-native';

import {Color} from '@app/colors';
import {app} from '@app/contexts';
import {onBannerAddClaimCode} from '@app/event-actions/on-banner-add-claim-code';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {I18N, getText} from '@app/i18n';
import {Refferal} from '@app/models/refferal';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';

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
    const ref = refferal[0];
    try {
      await onBannerAddClaimCode(ref.code);
    } catch (e) {
      if (e instanceof Error) {
        showModal('error', {
          title: getText(I18N.modalRewardErrorTitle),
          description: e.message,
          close: getText(I18N.modalRewardErrorClose),
          icon: 'reward_error',
          color: Color.graphicSecond4,
        });

        ref.update({
          isUsed: true,
        });
      }
    }
  }
}
