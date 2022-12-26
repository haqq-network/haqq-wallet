import React, {useCallback} from 'react';

import {Alert} from 'react-native';

import {SettingsAccountDetail} from '@app/components/settings-account-detail';
import {CustomHeader, IconsName} from '@app/components/ui';
import {useWallet, useWallets} from '@app/hooks';
import {useTypedNavigation} from '@app/hooks/use-typed-navigation';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {I18N, getText} from '@app/i18n';
import {sendNotification} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const SettingsAccountDetailScreen = () => {
  const navigation = useTypedNavigation();
  const params = useTypedRoute<'settingsAccountDetail'>().params;
  const {address} = params;
  const wallets = useWallets();
  const wallet = useWallet(address);

  const onPressRename = useCallback(() => {
    navigation.navigate('settingsAccountEdit', params);
  }, [navigation, params]);

  const onPressStyle = useCallback(() => {
    navigation.navigate('settingsAccountStyle', {
      address: address,
    });
  }, [navigation, address]);

  const onToggleIsHidden = useCallback(() => {
    if (wallet) {
      wallet.update({isHidden: !wallet.isHidden});
      if (wallet.isHidden) {
        sendNotification(I18N.notificationAccountHidden);
      }
    }
  }, [wallet]);

  const onViewingRecoveryPhrase = () => {
    navigation.navigate('pinGuard', {
      address,
      nextScreen: 'viewRecoveryPhrase',
    });
  };

  const onRemove = useCallback(() => {
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
            await wallets.removeWallet(address);
            navigation.goBack();
            sendNotification(I18N.notificationAccountDeleted);
          },
        },
      ],
    );
  }, [navigation, address, wallets]);

  if (!(wallet && wallet.isValid())) {
    return null;
  }

  return (
    <>
      <CustomHeader
        title={I18N.settingsAccountDetailHeaderTitle}
        iconLeft={IconsName.arrow_back}
        onPressLeft={navigation.goBack}
        iconRight={IconsName.trash}
        onPressRight={onRemove}
      />
      <SettingsAccountDetail
        wallet={wallet}
        onPressRename={onPressRename}
        onPressStyle={onPressStyle}
        onToggleIsHidden={onToggleIsHidden}
        onViewingRecoveryPhrase={onViewingRecoveryPhrase}
      />
    </>
  );
};
