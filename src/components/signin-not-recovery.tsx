import React from 'react';

import {Image, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';

import {Button, ButtonVariant, Spacer, Text} from './ui';

interface SignNotExistsProps {
  onPressOldPin(): void;

  onPressChange(): void;
}

export const SigninNotRecovery = ({
  onPressOldPin,
  onPressChange,
}: SignNotExistsProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <View>
        <Image source={{uri: 'question-square'}} style={styles.img} />
        <Spacer height={44} />
        <Text t4 center i18n={I18N.signNotRecoveryTitle} />
        <Spacer height={5} />
        <Text
          t11
          color={Color.textBase2}
          center
          i18n={I18N.signNotRecoveryDescription}
        />
      </View>

      <View style={styles.buttonContainer}>
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

        <Spacer height={insets.bottom} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  img: {
    height: 136,
    width: 136,
    alignSelf: 'center',
  },
  container: {
    marginHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  button: {
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
  },
});
