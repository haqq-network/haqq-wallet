import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {Alert, StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton} from '@app/components/ui';
import {sendNotification} from '@app/helpers';
import {useWallets} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

type SettingsAccountRemoveButtonProp = {
  address: string;
};

export const SettingsAccountRemoveButton = ({
  address,
}: SettingsAccountRemoveButtonProp) => {
  const navigation = useNavigation();
  const wallets = useWallets();
  const onClickRemove = () => {
    vibrate(HapticEffects.warning);
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
            sendNotification(I18N.notificationAccountDeleted);
          },
        },
      ],
    );
  };

  return (
    <IconButton style={page.container} onPress={onClickRemove}>
      <Icon name="trash" color={Color.graphicBase1} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {width: 24, height: 24},
});
