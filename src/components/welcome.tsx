import React from 'react';

import {Image, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {Button, ButtonVariant, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

type WelcomeProps = {
  naviagteToSignup: () => void;
  naviagteToLedger: () => void;
  naviagteToSignin: () => void;
};

export const Welcome = ({
  naviagteToSignup,
  naviagteToLedger,
  naviagteToSignin,
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
          source={require('../../assets/images/logo-empty.png')}
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
        onPress={naviagteToSignup}
      />
      <Button
        testID="welcome_ledger"
        i18n={I18N.welcomeLedgerWallet}
        iconRight="ledger"
        iconRightColor={Color.graphicGreen1}
        style={styles.button}
        variant={ButtonVariant.second}
        onPress={naviagteToLedger}
      />
      <Button
        testID="welcome_signin"
        i18n={I18N.welcomeRestoreWallet}
        style={styles.button}
        onPress={naviagteToSignin}
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
