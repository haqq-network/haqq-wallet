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
  onPrimaryPress(): void;

  onSecondaryPress(): void;
}

export const SigninSharesNotFound = ({
  onPrimaryPress,
  onSecondaryPress,
}: SignNotExistsProps) => {
  return (
    <PopupContainer style={styles.container}>
      <Image
        source={require('@assets/images/question-square.png')}
        style={styles.img}
      />
      <Spacer height={44} />
      <Text t4 center i18n={I18N.signSharesNotFoundTitle} />
      <Spacer height={5} />
      <Text
        t11
        color={Color.textBase2}
        center
        i18n={I18N.signSharesNotFoundDescription}
      />
      <Spacer />
      <Button
        style={styles.button}
        variant={ButtonVariant.contained}
        onPress={onPrimaryPress}
        i18n={I18N.signSharesNotFoundPrimaryButton}
      />
      <Button
        style={styles.button}
        variant={ButtonVariant.second}
        onPress={onSecondaryPress}
        i18n={I18N.signSharesNotFoundSecondaryButton}
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
    paddingHorizontal: 20,
    flex: 1,
  },
  button: {
    marginVertical: 8,
  },
});
