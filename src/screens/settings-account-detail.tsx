import React, {useCallback} from 'react';

import {SettingsAccountDetail} from '@app/components/settings-account-detail';
import {app} from '@app/contexts/app';
import {useWallet} from '@app/hooks';
import {useTypedNavigation} from '@app/hooks/use-typed-navigation';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {I18N, getText} from '@app/i18n';

export const SettingsAccountDetailScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'settingsAccountDetail'>();

  const wallet = useWallet(route.params.address);

  const onPressRename = useCallback(() => {
    navigation.navigate('settingsAccountEdit', route.params);
  }, [navigation, route.params]);

  const onPressStyle = useCallback(() => {
    navigation.navigate('settingsAccountStyle', {
      address: route.params.address,
    });
  }, [navigation, route.params.address]);

  const onToggleIsHidden = useCallback(() => {
    if (wallet) {
      wallet.isHidden = !wallet.isHidden;
      if (wallet.isHidden) {
        const notificationTitle = getText(
          I18N.settingsAccountDetailNotifacation,
        );
        app.emit('notification', notificationTitle);
      }
    }
  }, [wallet]);

  return (
    <SettingsAccountDetail
      onPressRename={onPressRename}
      onPressStyle={onPressStyle}
      onToggleIsHidden={onToggleIsHidden}
    />
  );
};
