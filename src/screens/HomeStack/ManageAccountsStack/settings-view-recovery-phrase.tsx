import React, {memo, useCallback, useState} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {SettingsViewRecoveryPhrase} from '@app/components/settings/settings-view-recovery-phrase';
import {CustomHeader, Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {
  ManageAccountsStackParamList,
  ManageAccountsStackRoutes,
} from '@app/route-types';
import {ModalType, WalletType} from '@app/types';

import {PinGuardScreen} from '../../pin-guard';

export const SettingsViewRecoveryPhraseScreen = memo(() => {
  const navigation = useTypedNavigation<ManageAccountsStackParamList>();
  const {accountId, type} = useTypedRoute<
    ManageAccountsStackParamList,
    ManageAccountsStackRoutes.SettingsViewRecoveryPhrase
  >().params;

  const [mnemonic, setMnemonic] = useState<string>('');

  const onEnter = useCallback(async () => {
    switch (type) {
      case WalletType.mnemonic:
        const providerMnemonic = new ProviderMnemonicReactNative({
          account: accountId,
          getPassword: app.getPassword.bind(app),
        });
        const phraseMnemonic = await providerMnemonic.getMnemonicPhrase();
        setMnemonic(phraseMnemonic ?? '');
        break;
      case WalletType.sss:
        const storage = await getProviderStorage(accountId);
        const providerSss = new ProviderSSSReactNative({
          storage,
          getPassword: app.getPassword.bind(app),
          account: accountId,
        });
        try {
          const phraseSss = await providerSss.getMnemonicPhrase();
          setMnemonic(phraseSss ?? '');
        } catch (err) {
          showModal(ModalType.cloudShareNotFound);
          navigation.goBack();
        }
        break;
    }
  }, [accountId, type]);

  return (
    <PinGuardScreen onEnter={onEnter}>
      <CustomHeader
        onPressLeft={navigation.goBack}
        iconLeft="arrow_back"
        title={I18N.settingsViewRecoveryPhraseTitle}
      />
      {!mnemonic && <Loading />}
      {mnemonic && <SettingsViewRecoveryPhrase mnemonic={mnemonic} />}
    </PinGuardScreen>
  );
});
