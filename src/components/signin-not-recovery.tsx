import React from 'react';

import {Image, StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {I18N} from '@app/i18n';

interface SignNotExistsProps {
  onPressOldPin(): void;

  onPressChange(): void;
}

export const SigninNotRecovery = ({
  onPressOldPin,
  onPressChange,
}: SignNotExistsProps) => {
  return (
    <PopupContainer style={styles.container}>
      <Image
        source={require('@assets/images/question-square.png')}
        style={styles.img}
      />
      <Spacer height={44} />
      <Text t4 center i18n={I18N.signNotRecoveryTitle} />
      <Spacer height={5} />
      <Text
        t11
        color={Color.textBase2}
        center
        i18n={I18N.signNotRecoveryDescription}
      />
      <Spacer />
      <Button
        style={styles.button}
        variant={ButtonVariant.contained}
        onPress={onPressOldPin}
        i18n={I18N.signNotRecoveryOldPin}
      />
      <Button
        style={styles.button}
        variant={ButtonVariant.second}
        onPress={onPressChange}
        i18n={I18N.signNotRecoveryChangeSocial}
      />
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  img: {
    height: 136,
    width: 136,
    alignSelf: 'center',
    marginVertical: 24,
  },
  container: {
    marginHorizontal: 20,
    flex: 1,
  },
  button: {
    marginVertical: 8,
  },
});
