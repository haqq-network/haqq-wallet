import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {Alert, StyleSheet} from 'react-native';

import {useWallets} from '@app/hooks';

import {IconButton, TrashIcon} from './ui';

import {app} from '../contexts/app';
import {LIGHT_GRAPHIC_BASE_1} from '../variables';

type SettingsAccountRemoveButtonProp = {
  address: string;
};

export const SettingsAccountRemoveButton = ({
  address,
}: SettingsAccountRemoveButtonProp) => {
  const navigation = useNavigation();
  const wallets = useWallets();
  const onClickRemove = () => {
    Alert.alert(
      'Attention. You may lose all your funds! Are you sure you want to delete your account?',
      'Do not delete the account if you are not sure that you can restore them. To restore, you will need a backup phrase of 12 words that you made for your account',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          style: 'destructive',
          text: 'Delete',
          onPress: async () => {
            await wallets.removeWallet(address);
            navigation.goBack();
            app.emit('notification', 'The account has been deleted');
          },
        },
      ],
    );
  };

  return (
    <IconButton style={page.container} onPress={onClickRemove}>
      <TrashIcon color={LIGHT_GRAPHIC_BASE_1} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {width: 24, height: 24},
});
