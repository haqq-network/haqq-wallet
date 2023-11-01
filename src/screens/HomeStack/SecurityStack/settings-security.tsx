import React, {memo, useCallback, useState} from 'react';

import {Alert} from 'react-native';

import {SettingsSecurity} from '@app/components/settings-security';
import {CustomHeader} from '@app/components/ui';
import {app} from '@app/contexts';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {
  SecurityStackParamList,
  SecurityStackRoutes,
} from '@app/screens/HomeStack/SecurityStack';
import {PinGuardScreen} from '@app/screens/pin-guard';

export const SettingsSecurityScreen = memo(() => {
  const navigation = useTypedNavigation<SecurityStackParamList>();
  const [biometry, setBiometry] = useState(app.biometry);

  const onSubmit = () => {
    navigation.navigate(SecurityStackRoutes.SettingsSecurityPin);
  };

  const onToggleBiometry = useCallback(async () => {
    if (!biometry) {
      try {
        await app.biometryAuth();
        app.biometry = true;
        setBiometry(true);
      } catch (e) {
        if (e instanceof Error) {
          Alert.alert(e.message);
        }
        app.biometry = false;
        setBiometry(false);
      }
    } else {
      app.biometry = false;
      setBiometry(false);
    }
  }, [biometry]);

  return (
    <PinGuardScreen>
      <CustomHeader
        onPressLeft={navigation.goBack}
        iconLeft="arrow_back"
        title={I18N.settingsSecurity}
      />
      <SettingsSecurity
        onSubmit={onSubmit}
        onToggleBiometry={onToggleBiometry}
        biometry={biometry}
        biometryType={app.biometryType}
      />
    </PinGuardScreen>
  );
});
