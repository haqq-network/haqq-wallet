import React, {memo, useCallback, useState} from 'react';

import {ProviderMnemonicBase, ProviderSSSBase} from '@haqq/rn-wallet-providers';

import {BackupWarning} from '@app/components/backup-warning';
import {SettingsViewRecoveryPhrase} from '@app/components/settings/settings-view-recovery-phrase';
import {CustomHeader, First, Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {getProviderStorage} from '@app/helpers/sss';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useError} from '@app/hooks/use-error';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {I18N} from '@app/i18n';
import {
  ManageAccountsStackParamList,
  ManageAccountsStackRoutes,
} from '@app/route-types';
import {ModalType, WalletType} from '@app/types';

import {PinGuardScreen} from '../../pin-guard';

export const SettingsViewRecoveryPhraseScreen = memo(() => {
  const navigation = useTypedNavigation<ManageAccountsStackParamList>();
  const {animate} = useLayoutAnimation();
  const {accountId, type} = useTypedRoute<
    ManageAccountsStackParamList,
    ManageAccountsStackRoutes.SettingsViewRecoveryPhrase
  >().params;

  const [mnemonic, setMnemonic] = useState<string>('');
  const [showWarning, setShowWarning] = useState(true);
  const showError = useError();

  const onEnter = useCallback(async () => {
    try {
      switch (type) {
        case WalletType.mnemonic:
          const providerMnemonic = new ProviderMnemonicBase({
            account: accountId,
            getPassword: app.getPassword.bind(app),
          });
          const phraseMnemonic = await providerMnemonic.getMnemonicPhrase();
          setMnemonic(phraseMnemonic ?? '');
          break;
        case WalletType.sss:
          const storage = await getProviderStorage(accountId);
          const providerSss = new ProviderSSSBase({
            storage,
            getPassword: app.getPassword.bind(app),
            account: accountId,
          });
          const phraseSss = await providerSss.getMnemonicPhrase();
          setMnemonic(phraseSss ?? '');
          break;
      }
    } catch (err) {
      switch (type) {
        case WalletType.mnemonic:
          Logger.captureException(err, 'SettingsViewRecoveryPhrase', {
            accountId,
            type,
          });
          showError('SettingsViewRecoveryPhrase', (err as Error).message);
          break;
        case WalletType.sss:
          showModal(ModalType.cloudShareNotFound);
          break;
      }
      navigation.goBack();
    }
  }, [accountId, type]);

  const handleHideWarning = () => {
    animate();
    setShowWarning(false);
  };

  return (
    <PinGuardScreen
      enabled
      onEnter={onEnter}
      title={I18N.settingsViewRecoveryPhraseTitle}>
      <CustomHeader
        onPressLeft={navigation.goBack}
        iconLeft="arrow_back"
        title={I18N.settingsViewRecoveryPhraseTitle}
      />
      <First>
        {!mnemonic && <Loading />}
        {showWarning && (
          <BackupWarning isSSS={false} onPressBackup={handleHideWarning} />
        )}
        <SettingsViewRecoveryPhrase mnemonic={mnemonic} />
      </First>
    </PinGuardScreen>
  );
});
