import React from 'react';

import {Image} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export interface SettingsNotificationNoPermissionProps {
  onPressGoToPhoneSettings: () => void;
}

export const SettingsNotificationNoPermission = ({
  onPressGoToPhoneSettings,
}: SettingsNotificationNoPermissionProps) => {
  return (
    <PopupContainer style={styles.container}>
      <Spacer />
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
        i18n={I18N.goToPhoneSettings}
        variant={ButtonVariant.second}
      />
      <Spacer />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    marginHorizontal: 32,
    flex: 1,
  },
  image: {
    tintColor: Color.graphicRed1,
    transform: [{scale: 1.1}],
    height: 96,
    width: 256,
    alignSelf: 'center',
  },
});
