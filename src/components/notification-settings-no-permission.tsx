import React from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {Button, ButtonVariant, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export interface SettingsNotificationNoPermissionProps {
  onPressGoToPhoneSettings: () => void;
}

export const SettingsNotificationNoPermission = ({
  onPressGoToPhoneSettings,
}: SettingsNotificationNoPermissionProps) => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require('@assets/images/notification_bell.png')}
      />
      <Spacer height={32} />
      <Text center t7 i18n={I18N.weDontHaveNotificationPermission} />
      <Spacer height={4} />
      <Text
        center
        t14
        i18n={I18N.weDontHaveNotificationPermissionDescription}
      />
      <Spacer height={40} />
      <Button
        onPress={onPressGoToPhoneSettings}
        style={styles.button}
        i18n={I18N.goToPhoneSettings}
        variant={ButtonVariant.second}
      />
    </View>
  );
};

const styles = createTheme({
  container: {
    marginHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  image: {
    tintColor: Color.graphicRed1,
    transform: [{scale: 1.1}],
    height: 96,
    width: 256,
  },
  button: {
    width: '100%',
  },
});
