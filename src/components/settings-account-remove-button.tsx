import React from 'react';
import {IconButton, TrashIcon} from './ui';
import {GRAPHIC_BASE_1} from '../variables';
import {useWallets} from '../contexts/wallets';
import {Alert} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';

type SettingsAccountRemoveButtonProp = CompositeScreenProps<any, any>;

export const SettingsAccountRemoveButton = ({
  navigation,
  route,
}: SettingsAccountRemoveButtonProp) => {
  const wallets = useWallets();
  const onClickRemove = () => {
    Alert.alert(
      'Attention. You may lose all your funds! Are you sure you want to delete your account?',
      'Do not delete the account if you are not sure that you can restore them. To restore, you will need a backup phrase of 12 words that you made for your account',
      [
        {
          text: 'Cancel',
        },
        {
          style: 'destructive',
          text: 'Delete',
          onPress: async () => {
            await wallets.removeWallet(route.params.address);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <IconButton style={{width: 24, height: 24}} onPress={onClickRemove}>
      <TrashIcon color={GRAPHIC_BASE_1} />
    </IconButton>
  );
};
