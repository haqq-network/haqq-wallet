import React, {useCallback} from 'react';

import {Alert} from 'react-native';
import RNRestart from 'react-native-restart';

import {SettingsAbout} from '@app/components/settings-about';
import {I18N, getText} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {sleep} from '@app/utils';

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
          onPress: async () => {
            AppStore.isTesterModeEnabled = true;
            vibrate(HapticEffects.success);
            await sleep(200);
            RNRestart.restart();
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
