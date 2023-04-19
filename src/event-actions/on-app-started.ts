import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';
import messaging from '@react-native-firebase/messaging';
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
import {navigator} from '@app/navigator';

export async function onAppStarted() {
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        app.emit(Events.onPushNotification, remoteMessage);
      }
    });

  const initialUrl = await Linking.getInitialURL();

  if (initialUrl && initialUrl.startsWith('haqq:')) {
    app.emit(Events.onDeepLink, initialUrl);
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
}
