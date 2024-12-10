import React, {useCallback} from 'react';

import {Alert} from 'react-native';

import {SettingsAbout} from '@app/components/settings-about';
import {I18N, getText} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {navigator} from '@app/navigator';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const SettingsAboutScreen = () => {
  const onEnableDevMode = useCallback(() => {
    vibrate(HapticEffects.warning);
    Alert.alert(
      getText(I18N.developerModeAttentionTitle),
      getText(I18N.developerModeAttentionDescription),
      [
        {
          text: getText(I18N.developerModeAttentionEnable),
          style: 'destructive',
          onPress: () => {
            AppStore.isTesterModeEnabled = true;
            vibrate(HapticEffects.success);
            navigator.goBack();
          },
        },
        {
          isPreferred: true,
          text: getText(I18N.developerModeAttentionCancel),
          style: 'default',
        },
      ],
    );
  }, []);

  const onPressEnableDevMode = useCallback((clickCount: number) => {
    if (clickCount > 2) {
      vibrate(HapticEffects.impactLight);
    }
  }, []);

  return (
    <SettingsAbout
      onEnableDevMode={onEnableDevMode}
      onPressEnableDevMode={onPressEnableDevMode}
    />
  );
};
