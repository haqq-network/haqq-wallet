import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';
import {isAfter} from 'date-fns';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {VariablesDate} from '@app/models/variables-date';
import {navigator} from '@app/navigator';

export async function onAppBackup() {
  const snoozed = VariablesDate.get('appBackupSnooze');

  if (snoozed && isAfter(snoozed, new Date())) {
    return;
  }

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
