import React, { useCallback } from 'react';
import { SettingsAccountDetail } from '@app/components/settings-account-detail';
import { RouteProp, useRoute } from '@react-navigation/native';


import { RootStackParamList } from '../types';
import { useTypedNavigation } from '@app/hooks/use-typed-navigation';

import { useWallet } from '@app/hooks';
import {app} from '@app/contexts/app';

export const SettingsAccountDetailScreen = () => {
  const navigation = useTypedNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'settingsAccountDetail'>>();
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

