import React, {useCallback, useEffect, useRef} from 'react';

import {Alert, Animated, Dimensions, StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {Events} from '@app/events';
import {captureException, hideModal} from '@app/helpers';
import {useApp, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Transaction} from '@app/models/transaction';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {BottomSheet, BottomSheetRef} from './bottom-sheet';
import {Button, ButtonVariant, Spacer, Text} from './ui';

const h = Dimensions.get('window').height;
const closeDistance = h / 5;

type RestorePasswordProps = {
  onClose: () => void;
};

export const RestorePassword = ({onClose}: RestorePasswordProps) => {
  const wallet = useWallets();
  const app = useApp();
  const pan = useRef(new Animated.Value(1)).current;
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const onClosePopup = useCallback(() => {
    Animated.timing(pan, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(onClose);
  }, [pan, onClose]);

  const onOpenPopup = useCallback(() => {
    Animated.timing(pan, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [pan]);

  useEffect(() => {
    onOpenPopup();
  }, [onOpenPopup]);

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
          onPress: async () => {
            try {
              wallet.clean();
              Transaction.removeAll();
              Contact.removeAll();
              await app.clean();
              bottomSheetRef.current?.close?.();
              Animated.timing(pan, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }).start(() => {
                hideModal('splash');
                hideModal('pin');
                app.emit(Events.onWalletReset);
              });
            } catch (e) {
              captureException(e);
            }
          },
        },
      ],
    );
  }, [app, pan, wallet]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onClose={onClosePopup}
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
