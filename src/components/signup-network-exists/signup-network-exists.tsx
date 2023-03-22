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
import {MpcProviders} from '@app/services/provider-mpc';

export type SignupNetworkExistsProps = {
  provider: MpcProviders;
  email?: string;
  onRestore: () => void;
  onRewrite: () => void;
};

export const SignupNetworkExists = ({
  provider,
  email,
  onRestore,
  onRewrite,
}: SignupNetworkExistsProps) => {
  return (
    <PopupContainer style={styles.container}>
      <Image
        source={require('@assets/images/signup-network-exists-warning.png')}
        style={styles.img}
      />
      <Spacer height={44} />
      <Text
        t4
        center
        i18n={
          email
            ? I18N.signupNetworkExitsTitle
            : I18N.signupNetworkExitsTitleWithoutEmail
        }
        i18params={{provider, email: email || ''}}
      />
      <Spacer height={4} />
      <Text
        t11
        color={Color.textBase2}
        center
        i18n={I18N.signupNetworkExitsDescription1}
      />
      <Spacer height={4} />
      <Text
        t11
        color={Color.textRed1}
        center
        i18n={I18N.signupNetworkExitsDescription2}
      />
      <Spacer />
      <Button
        i18n={I18N.signupNetworkExistsRestore}
        onPress={onRestore}
        variant={ButtonVariant.contained}
      />
      <Spacer height={16} />
      <Button
        i18n={I18N.signupNetworkExistsRewrite}
        onPress={onRewrite}
        variant={ButtonVariant.text}
        textColor={Color.textRed1}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  img: {
    height: 136,
    width: 136,
    alignSelf: 'center',
    marginVertical: 24,
  },
});
