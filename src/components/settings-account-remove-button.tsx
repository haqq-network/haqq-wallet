import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {Alert} from 'react-native';

import {IconButton, TrashIcon} from './ui';

import {Color, getColor} from '../colors';
import {app} from '../contexts/app';
import {useWallets} from '../contexts/wallets';
import {createTheme} from '../helpers/create-theme';

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
      <TrashIcon color={getColor(Color.graphicBase1)} />
    </IconButton>
  );
};

const page = createTheme({
  container: {width: 24, height: 24},
});
