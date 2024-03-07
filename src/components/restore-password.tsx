import React, {useCallback, useRef} from 'react';

import {Alert, StyleSheet} from 'react-native';

import {onAppReset} from '@app/event-actions/on-app-reset';
import {onWalletReset} from '@app/event-actions/on-wallet-reset';
import {hideModal, showModal} from '@app/helpers';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Color} from '@app/theme';
import {ModalType} from '@app/types';
import {sleep} from '@app/utils';

import {BottomSheet, BottomSheetRef} from './bottom-sheet';
import {Button, ButtonVariant, Spacer, Text} from './ui';

type RestorePasswordProps = {
  onClose: () => void;
};

const LOADING_DURATION = 600;

export const RestorePassword = ({onClose}: RestorePasswordProps) => {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const closeDistance = useCalculatedDimensionsValue(({height}) => height / 5);
  const onClickResetConfirm = useCallback(async () => {
    await bottomSheetRef.current?.close?.();
    const closeLoading = showModal(ModalType.loading);
    try {
      await sleep(LOADING_DURATION);
      await onAppReset();
      hideModal(ModalType.pin);
      hideModal(ModalType.splash);
      await onWalletReset();
    } catch (e) {
      Logger.captureException(e, 'onClickResetConfirm');
    } finally {
      closeLoading();
    }
  }, []);

  const onClickReset = useCallback(() => {
    vibrate(HapticEffects.warning);
    Alert.alert(
      getText(I18N.restorePasswordAttentionTitle),
      getText(I18N.restorePasswordAttentionSubtitle),
      [
        {
          text: getText(I18N.cancel),
          style: 'cancel',
        },
        {
          style: 'destructive',
          text: getText(I18N.restorePasswordReset),
          onPress: onClickResetConfirm,
        },
      ],
    );
  }, [onClickResetConfirm]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onClose={onClose}
      i18nTitle={I18N.restorePasswordForgot}
      closeDistance={closeDistance}>
      <Text t14 color={Color.textBase2} i18n={I18N.restorePasswordWarning} />
      <Spacer height={24} />
      <Button
        error
        variant={ButtonVariant.second}
        i18n={I18N.restorePasswordResetWallet}
        onPress={onClickReset}
        style={page.button}
        testID="reset_wallet"
      />
    </BottomSheet>
  );
};

const page = StyleSheet.create({
  button: {
    marginBottom: 16,
  },
});
