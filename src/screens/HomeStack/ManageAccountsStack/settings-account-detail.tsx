import React, {useCallback, useEffect} from 'react';

import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {observer} from 'mobx-react';
import {Alert, Platform} from 'react-native';

import {SettingsAccountDetail} from '@app/components/settings/settings-account-detail';
import {CustomHeader, IconsName} from '@app/components/ui';
import {hideModal, showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks/use-typed-navigation';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  HomeStackRoutes,
  ManageAccountsStackParamList,
  ManageAccountsStackRoutes,
} from '@app/route-types';
import {sendNotification} from '@app/services';
import {EventTracker} from '@app/services/event-tracker';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {MarketingEvents, ModalType, WalletType} from '@app/types';

export const SettingsAccountDetailScreen = observer(() => {
  const navigation = useTypedNavigation<ManageAccountsStackParamList>();
  const params = useTypedRoute<
    ManageAccountsStackParamList,
    ManageAccountsStackRoutes.SettingsAccountDetail
  >().params;
  const {address, fromHomePage} = params;
  const wallet = Wallet.getById(address);

  const onPressRename = useCallback(() => {
    navigation.navigate(ManageAccountsStackRoutes.SettingsAccountEdit, params);
  }, [navigation, params]);

  const onPressStyle = useCallback(() => {
    navigation.navigate(ManageAccountsStackRoutes.SettingsAccountStyle, {
      address: address,
    });
  }, [navigation, address]);

  useEffect(() => {
    EventTracker.instance.trackEvent(MarketingEvents.settingsAccountDetails, {
      address: address,
    });
  }, [address]);

  const onToggleIsHidden = useCallback(async () => {
    if (wallet) {
      await Wallet.toggleIsHidden(wallet.address);
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
          type: wallet.type,
        },
      );
    }
  }, [navigation, wallet?.accountId, wallet?.type]);

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
            showModal(ModalType.loading);
            requestAnimationFrame(async () => {
              const sssWalletsCountBefore = Wallet.count(WalletType.sss);
              const accountID = wallet?.accountId;
              const providerArray =
                await ProviderSSSReactNative.getStoragesForAccount(accountID!);
              await Wallet.remove(address);
              hideModal(ModalType.loading);
              navigation.goBack();
              sendNotification(I18N.notificationAccountDeleted);
              const sssWalletsCountAfter = Wallet.count(WalletType.sss);

              // If it was last SSS wallet show RemoveSSS modal
              if (
                sssWalletsCountBefore > 0 &&
                sssWalletsCountAfter === 0 &&
                accountID
              ) {
                const defaultProviderIfCurrentMissing =
                  Platform.OS === 'android' ? 'googleDrive' : 'cloud';
                const provider =
                  providerArray.length === 0
                    ? defaultProviderIfCurrentMissing
                    : providerArray.includes('cloud')
                    ? 'cloud'
                    : 'googleDrive';
                showModal(ModalType.removeSSS, {
                  accountID,
                  provider,
                });
              }
            });
          },
        },
      ],
    );
  }, [navigation, address]);

  const onPressPhrase = useCallback(() => {
    if (wallet) {
      navigation.navigate(HomeStackRoutes.Backup, {
        wallet,
      });
    }
  }, [navigation, wallet?.accountId]);

  const onPressSocial = useCallback(() => {
    navigation.navigate(HomeStackRoutes.SssMigrate, {
      accountId: wallet?.accountId!,
    });
  }, [navigation, wallet?.accountId]);

  const onPressBack = () => {
    if (fromHomePage) {
      navigation.push(HomeStackRoutes.Home);
      return;
    }
    navigation.goBack();
  };

  if (!wallet) {
    return null;
  }

  return (
    <>
      <CustomHeader
        title={I18N.settingsAccountDetailHeaderTitle}
        iconLeft={IconsName.arrow_back}
        onPressLeft={onPressBack}
        iconRight={IconsName.trash}
        onPressRight={onRemove}
      />
      <SettingsAccountDetail
        wallet={wallet}
        onPressRename={onPressRename}
        onPressStyle={onPressStyle}
        onToggleIsHidden={onToggleIsHidden}
        onViewingRecoveryPhrase={onViewingRecoveryPhrase}
        onPressPhrase={onPressPhrase}
        onPressSocial={onPressSocial}
      />
    </>
  );
});
