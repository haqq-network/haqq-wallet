import React, {useCallback, useEffect, useRef} from 'react';
import {Alert, Animated, Dimensions, StyleSheet} from 'react-native';
import {TEXT_BASE_2} from '../variables';
import {Button, ButtonVariant, Text} from './ui';
import {useWallets} from '../contexts/wallets';
import {useApp} from '../contexts/app';
import {BottomSheet} from './bottom-sheet';
import {useTransactions} from '../contexts/transactions';
import {useContacts} from '../contexts/contacts';

const h = Dimensions.get('window').height;
const closeDistance = h / 5;

type RestorePasswordProps = {
  onClose: () => void;
};

export const RestorePassword = ({onClose}: RestorePasswordProps) => {
  const wallet = useWallets();
  const transactions = useTransactions();
  const contacts = useContacts();
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
    return Alert.alert(
      'Attention. You may lose all your funds!',
      'Do not reset the application if you are not sure that you can restore your account. To restore, you will need a backup phrase of 12 words that you made for your account',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          style: 'destructive',
          text: 'Reset',
          onPress: async () => {
            try {
              // wallet.clean();
              // transactions.clean();
              // contacts.clean();
              await app.clean();
              Animated.timing(pan, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }).start(() => {
                app.emit('resetWallet');
              });
            } catch (e) {
              console.log(e.message);
            }
          },
        },
      ],
    );
  }, [app, contacts, pan, transactions, wallet]);

  return (
    <BottomSheet
      onClose={onClosePopup}
      title="Forgot the code?"
      closeDistance={closeDistance}>
      <Text clean style={page.warning}>
        Unfortunately, the password cannot be reset. Try to wait a bit and
        remember the password. If it does not work, then click the ‘Reset wallet
        button and use the backup phrase to restore the wallet. If there is no
        backup phrase, then you will not be able to restore the wallet
      </Text>
      <Button
        variant={ButtonVariant.error}
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
    color: TEXT_BASE_2,
  },
});
