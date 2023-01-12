import React, {useCallback, useEffect, useRef} from 'react';

import {Alert, Animated, Dimensions, StyleSheet} from 'react-native';

import {captureException} from '@app/helpers';
import {useApp, useTransactions, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {LIGHT_TEXT_BASE_2} from '@app/variables/common';

import {BottomSheet} from './bottom-sheet';
import {Button, ButtonVariant, Text} from './ui';

const h = Dimensions.get('window').height;
const closeDistance = h / 5;

type RestorePasswordProps = {
  onClose: () => void;
};

export const RestorePassword = ({onClose}: RestorePasswordProps) => {
  const wallet = useWallets();
  const transactions = useTransactions();
  const app = useApp();
  const pan = useRef(new Animated.Value(1)).current;

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
              transactions.clean();
              Contact.removeAll();
              await app.clean();
              Animated.timing(pan, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }).start(() => {
                app.emit('resetWallet');
              });
            } catch (e) {
              captureException(e);
            }
          },
        },
      ],
    );
  }, [app, pan, transactions, wallet]);

  return (
    <BottomSheet
      onClose={onClosePopup}
      i18nTitle={I18N.restorePasswordForgot}
      closeDistance={closeDistance}>
      <Text clean style={page.warning}>
        Unfortunately, the password cannot be reset. Try to wait a bit and
        remember the password. If it does not work, then click the ‘Reset wallet
        button and use the backup phrase to restore the wallet. If there is no
        backup phrase, then you will not be able to restore the wallet
      </Text>
      <Button
        error
        variant={ButtonVariant.second}
        title="Reset wallet"
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
  warning: {
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 18,
    color: LIGHT_TEXT_BASE_2,
  },
});
