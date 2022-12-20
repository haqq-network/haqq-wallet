import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {Alert, StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton} from '@app/components/ui';
import {useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {sendNotification} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const SettingsAccountRemoveButton = () => {
  const navigation = useNavigation();
  const route = useTypedRoute<'settingsAccountDetail'>();
  const wallets = useWallets();
  const onClickRemove = () => {
    vibrate(HapticEffects.warning);
    Alert.alert(
      getText(I18N.settingsAccountRemoveTitle),
      getText(I18N.settingsAccountRemoveMessage),
      [
        {
          text: getText(I18N.settingsAccountRemoveReject),
          style: 'cancel',
        },
        {
          style: 'destructive',
          text: getText(I18N.settingsAccountRemoveConfirm),
          onPress: async () => {
            await wallets.removeWallet(route.params.address);
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
