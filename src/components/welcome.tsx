import React from 'react';

import {Image, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Button, ButtonSize, ButtonVariant, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Color, createTheme} from '@app/theme';

type WelcomeProps = {
  onPressSignup: () => void;
  onPressHardwareWallet: () => void;
  onPressSignIn: () => void;
};

export const Welcome = ({
  onPressSignup,
  onPressHardwareWallet,
  onPressSignIn,
}: WelcomeProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}
      testID="welcome">
      <View style={styles.content}>
        <Image
          source={require('@assets/images/logo-empty.png')}
          style={styles.imageStyle}
        />
        <Text t4 style={styles.title} i18n={I18N.welcomeTitle} />
        <Text
          t11
          center
          color={Color.textBase2}
          i18n={I18N.welcomeDescription}
        />
      </View>

      <Button
        i18n={I18N.welcomeCreateWallet}
        testID="welcome_signup"
        style={styles.button}
        variant={ButtonVariant.contained}
        onPress={onPressSignup}
        size={ButtonSize.large}
      />
      <Button
        testID="welcome_connect_hardware_wallet"
        i18n={I18N.welcomeConnectHardwareWallet}
        variant={ButtonVariant.second}
        onPress={onPressHardwareWallet}
        size={ButtonSize.large}
      />
      <Button
        testID="welcome_signin"
        i18n={I18N.welcomeRestoreWallet}
        style={styles.button}
        onPress={onPressSignIn}
        size={ButtonSize.large}
      />
    </View>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
  },
  button: {
    marginBottom: 16,
  },
  imageStyle: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 28,
  },
});
