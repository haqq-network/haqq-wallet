import React, {useCallback, useEffect} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import CustomAuth from '@toruslabs/customauth-react-native-sdk';
import {mnemonicToEntropy} from 'ethers/lib/utils';

import {BottomPopupContainer} from '@app/components/bottom-popups';
import {BackupMpcSuggestion} from '@app/components/bottom-popups/popup-backup-mpc-suggestion';
import {captureException, showModal} from '@app/helpers';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {GoogleDrive} from '@app/services/google-drive';
import {
  MpcProviders,
  ProviderMpcReactNative,
  customAuthInit,
  verifierMap,
} from '@app/services/provider-mpc';
import {StorageMock} from '@app/services/storage-mock';
import {WalletType} from '@app/types';

export const BackupMpcSuggestionScreen = () => {
  const {goBack} = useTypedNavigation();
  const {accountId} = useTypedRoute<'backupMpcSuggestion'>().params;

  const app = useApp();

  useEffect(() => {
    customAuthInit();
  }, []);

  const onClickBackup = useCallback(
    async (onDone: () => void) => {
      try {
        if (accountId) {
          const getPassword = app.getPassword.bind(app);

          const mnemonicProvider = new ProviderMnemonicReactNative({
            account: accountId,
            getPassword,
          });

          const mnemonic = await mnemonicProvider.getMnemonicPhrase();
          let entropy = mnemonicToEntropy(mnemonic);

          if (entropy.startsWith('0x')) {
            entropy = entropy.slice(2);
          }

          entropy = entropy.padStart(64, '0');

          const loginDetails = await CustomAuth.triggerLogin(
            verifierMap[MpcProviders.auth0],
          );

          const storage = app.isGoogleSignedIn
            ? await GoogleDrive.initialize()
            : new StorageMock();

          const provider = await ProviderMpcReactNative.initialize(
            loginDetails.privateKey,
            null,
            null,
            entropy,
            getPassword,
            storage,
            {},
          );

          const wallets = Wallet.getAll();

          for (const wallet of wallets) {
            if (
              wallet.accountId === accountId &&
              wallet.type === WalletType.mnemonic
            ) {
              wallet.update({
                type: WalletType.mpc,
                accountId: provider.getIdentifier(),
              });
            }
          }

          goBack();
          onDone();
        }
      } catch (e) {
        captureException(e, 'save mpc backup');
        showModal('transaction-error', {
          message: 'backup save error',
        });
      }
    },
    [accountId, app, goBack],
  );

  const onClickSkip = useCallback(
    (onDone: () => void) => {
      app.setSnoozeBackup();
      goBack();
      onDone();

      return Promise.resolve();
    },
    [app, goBack],
  );

  return (
    <BottomPopupContainer>
      {onClose => (
        <BackupMpcSuggestion
          onClickBackup={() => onClickBackup(onClose)}
          onClickSkip={() => onClickSkip(onClose)}
        />
      )}
    </BottomPopupContainer>
  );
};
