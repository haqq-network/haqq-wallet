import React, {memo, useCallback, useEffect} from 'react';

import {Alert} from 'react-native';

import {SettingsAccountDetail} from '@app/components/settings-account-detail';
import {CustomHeader, IconsName} from '@app/components/ui';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {hideModal, showModal} from '@app/helpers';
import {useWallet} from '@app/hooks';
import {useTypedNavigation} from '@app/hooks/use-typed-navigation';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {HomeStackRoutes} from '@app/screens/HomeStack';
import {
  ManageAccountsStackParamList,
  ManageAccountsStackRoutes,
} from '@app/screens/HomeStack/ManageAccountsStack';
import {SettingsStackRoutes} from '@app/screens/HomeStack/SettingsStack';
import {sendNotification} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {AdjustEvents} from '@app/types';

export const SettingsAccountDetailScreen = memo(() => {
  const navigation = useTypedNavigation<ManageAccountsStackParamList>();
  const params = useTypedRoute<
    ManageAccountsStackParamList,
    ManageAccountsStackRoutes.SettingsAccountDetail
  >().params;
  const {address} = params;
  const wallet = useWallet(address);

  const onPressRename = useCallback(() => {
    navigation.navigate(ManageAccountsStackRoutes.SettingsAccountEdit, params);
  }, [navigation, params]);

  const onPressStyle = useCallback(() => {
    navigation.navigate(ManageAccountsStackRoutes.SettingsAccountStyle, {
      address: address,
    });
  }, [navigation, address]);

  useEffect(() => {
    onTrackEvent(AdjustEvents.settingsAccountDetails, {
      address: address,
    });
  }, [address]);

  const onToggleIsHidden = useCallback(async () => {
    if (wallet) {
      await wallet.toggleIsHidden();
      if (wallet.isHidden) {
        sendNotification(I18N.notificationAccountHidden);
      }
    }
  }, [wallet]);

  const onViewingRecoveryPhrase = useCallback(() => {
    if (wallet?.accountId) {
      navigation.navigate(
        ManageAccountsStackRoutes.SettingsViewRecoveryPhrase,
        {
          accountId: wallet.accountId,
        },
      );
    }
  }, [navigation, wallet?.accountId]);

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
          onPress: () => {
            showModal('loading');
            requestAnimationFrame(async () => {
              await Wallet.remove(address);
              hideModal('loading');
              navigation.goBack();
              sendNotification(I18N.notificationAccountDeleted);
            });
          },
        },
      ],
    );
  }, [navigation, address]);

  const onPressPharse = useCallback(() => {
    navigation.navigate(HomeStackRoutes.Backup, {
      accountId: wallet?.accountId!,
    });
  }, [navigation, wallet?.accountId]);

  const onPressSocial = useCallback(() => {
    //FIXME: Test this
    navigation.navigate(SettingsStackRoutes.BackupSssSuggestion, {
      accountId: wallet?.accountId!,
    });
  }, [navigation, wallet?.accountId]);

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
        onPressPharse={onPressPharse}
        onPressSocial={onPressSocial}
      />
    </>
  );
});
