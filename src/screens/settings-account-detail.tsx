import React, {useCallback} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {SettingsAccountDetail} from '@app/components/settings-account-detail';
import {app} from '@app/contexts/app';
import {useWallet} from '@app/hooks';
import {useTypedNavigation} from '@app/hooks/use-typed-navigation';

import {RootStackParamList} from '../types';

export const SettingsAccountDetailScreen = () => {
  const navigation = useTypedNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'settingsAccountDetail'>>();
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
        app.emit('notification', 'The account was hidden');
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
