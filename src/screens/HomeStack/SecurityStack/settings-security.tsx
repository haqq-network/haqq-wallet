import React, {memo, useCallback, useMemo, useState} from 'react';

import {ProviderSSSBase} from '@haqq/rn-wallet-providers';
import {Alert, Keyboard, Platform} from 'react-native';

import {SettingsSecurity} from '@app/components/settings/settings-security';
import {CustomHeader} from '@app/components/ui';
import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {SecurePinUtils} from '@app/helpers/secure-pin-utils';
import {generateNewSharesForAll} from '@app/helpers/sss/generate-new-shares';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {SecurityStackParamList, SecurityStackRoutes} from '@app/route-types';
import {PinGuardScreen} from '@app/screens/pin-guard';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType, WalletType} from '@app/types';

export const SettingsSecurityScreen = memo(() => {
  const navigation = useTypedNavigation<SecurityStackParamList>();
  const [biometry, setBiometry] = useState(app.biometry);
  const [blindSignEnabled, setBlindSignEnabled] = useState(
    app.blindSignEnabled,
  );

  const onSubmit = () => {
    navigation.navigate(SecurityStackRoutes.SettingsSecurityPin);
  };

  const onToggleBiometry = useCallback(async () => {
    if (!biometry) {
      try {
        await app.biometryAuth();
        app.biometry = true;
        setBiometry(true);
      } catch (e) {
        if (e instanceof Error) {
          Alert.alert(e.message);
        }
        app.biometry = false;
        setBiometry(false);
      }
    } else {
      app.biometry = false;
      setBiometry(false);
    }
  }, [biometry]);

  const [recoveryPin, setRecoveryPin] = useState('');
  const isRecoveryButtonDisabled = useMemo(
    () => recoveryPin.length !== 6,
    [recoveryPin],
  );
  const onRecoveryPress = useCallback(async () => {
    try {
      Keyboard.dismiss();
      showModal(ModalType.loading);
      const appPin = await app.getPassword();
      if (appPin === recoveryPin) {
        showModal(ModalType.error, {
          title: getText(I18N.recoveryPinTitle),
          description: getText(I18N.recoveryPinSamePin),
          close: getText(I18N.pinErrorModalClose),
        });
        return;
      }
      const success = await SecurePinUtils.recoveryPin(recoveryPin);
      if (success) {
        showModal(ModalType.error, {
          title: getText(I18N.recoveryPinTitle),
          description: getText(I18N.recoveryPinSuccess),
          close: getText(I18N.pinErrorModalClose),
        });
      } else {
        showModal(ModalType.error, {
          title: getText(I18N.recoveryPinTitle),
          description: getText(I18N.recoveryPinNoNeedRecovery),
          close: getText(I18N.pinErrorModalClose),
        });
      }
    } catch (e) {
      Logger.captureException(e, 'SettingsSecurity.onRecoveryPress');
      const description = (e as Error)?.message;
      showModal(ModalType.error, {
        title: getText(I18N.pinErrorModalRecoveryFail),
        description,
        close: getText(I18N.pinErrorModalClose),
      });
    } finally {
      hideModal(ModalType.loading);
    }
  }, [recoveryPin]);

  const onRecoveryPinChange = useCallback(
    (text: string) => {
      setRecoveryPin(text?.trim()?.replace(/\D/g, '').slice(0, 6));
    },
    [setRecoveryPin],
  );

  const onToggleBlindSign = useCallback(() => {
    const next = !app.blindSignEnabled;
    setBlindSignEnabled(next);
    app.blindSignEnabled = next;
  }, []);

  const onSssRemove = useCallback(() => {
    vibrate(HapticEffects.warning);
    requestAnimationFrame(async () => {
      const accountID = Wallet.getAll().find(w => w.type === WalletType.sss)
        ?.accountId;
      if (accountID) {
        const providerArray = await ProviderSSSBase.getStoragesForAccount(
          accountID,
        );

        const defaultProviderIfCurrentMissing =
          Platform.OS === 'android' ? 'googleDrive' : 'cloud';
        const provider =
          providerArray.length === 0
            ? defaultProviderIfCurrentMissing
            : providerArray.includes('cloud')
            ? 'cloud'
            : 'googleDrive';
        showModal(ModalType.removeSSS, {
          accountID,
          provider,
        });
      }
    });
  }, [navigation]);

  const onPressGenerateNewShares = useCallback(async () => {
    const closeLoading = showModal(ModalType.loading);
    try {
      await generateNewSharesForAll();
    } catch (error) {
      Logger.captureException(
        error,
        'SettingsSecurity.onPressGenerateNewShares',
      );
    } finally {
      closeLoading();
    }
  }, []);

  return (
    <PinGuardScreen enabled title={I18N.settingsSecurity}>
      <CustomHeader
        onPressLeft={navigation.goBack}
        iconLeft="arrow_back"
        title={I18N.settingsSecurity}
      />
      <SettingsSecurity
        onSubmit={onSubmit}
        onSssRemove={onSssRemove}
        onToggleBiometry={onToggleBiometry}
        biometry={biometry}
        biometryType={app.biometryType}
        recoveryPin={recoveryPin}
        isRecoveryButtonDisabled={isRecoveryButtonDisabled}
        onRecoveryPress={onRecoveryPress}
        onRecoveryPinChange={onRecoveryPinChange}
        blindSignEnabled={blindSignEnabled}
        onToggleBlindSign={onToggleBlindSign}
        onPressGenerateNewShares={onPressGenerateNewShares}
      />
    </PinGuardScreen>
  );
});
