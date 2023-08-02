import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {isAfter} from 'date-fns';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {VariablesDate} from '@app/models/variables-date';
import {navigator} from '@app/navigator';

/**
 * @description Check if mnemonic or sss is not backed up and show backup suggestion
 */
export async function onAppBackup() {
  const snoozed = VariablesDate.get('appBackupSnooze');

  if (snoozed && isAfter(snoozed, new Date())) {
    return;
  }

  const mnemonics = await ProviderMnemonicReactNative.getAccounts();

  if (isFeatureEnabled(Feature.sss)) {
    const sss = await ProviderSSSReactNative.getAccounts();
    if (mnemonics.length && !sss.length) {
      navigator.navigate('backupSssSuggestion', {accountId: mnemonics[0]});
      return;
    }

    if (sss.length) {
      app.emit(Events.onWalletSssCheck, app.snoozeBackup);
    }
  }
  if (mnemonics.length) {
    app.emit(Events.onWalletMnemonicCheck, app.snoozeBackup);
  }
}
