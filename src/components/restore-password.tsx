import React, {useCallback, useRef} from 'react';

import {Alert, Dimensions, StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {onAppReset} from '@app/event-actions/on-app-reset';
import {onWalletReset} from '@app/event-actions/on-wallet-reset';
import {captureException, hideModal, showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {sleep} from '@app/utils';

import {BottomSheet, BottomSheetRef} from './bottom-sheet';
import {Button, ButtonVariant, Spacer, Text} from './ui';

const h = Dimensions.get('window').height;
const closeDistance = h / 5;

type RestorePasswordProps = {
  onClose: () => void;
};

const LOADING_DURATION = 600;

export const RestorePassword = ({onClose}: RestorePasswordProps) => {
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const onClickResetConfirm = useCallback(async () => {
    await bottomSheetRef.current?.close?.();
    const closeLoading = showModal('loading');
    try {
      await sleep(LOADING_DURATION);
      await onAppReset();
      hideModal('pin');
      hideModal('splash');
      await onWalletReset();
    } catch (e) {
      captureException(e, 'onClickResetConfirm');
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
      />
    </BottomSheet>
  );
};

const page = StyleSheet.create({
  button: {
    marginBottom: 16,
  },
});
