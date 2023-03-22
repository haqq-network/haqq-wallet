import React from 'react';

import {Image, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';
import {MpcProviders} from '@app/services/provider-mpc';

import {Button, ButtonVariant, Spacer, Text} from './ui';

interface SignNotExistsProps {
  provider: MpcProviders;
  email?: string;

  onPressCreate(): void;

  onPressChoice(): void;
}

export const SigninNotExists = ({
  provider,
  email,
  onPressChoice,
  onPressCreate,
}: SignNotExistsProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require('@assets/images/question-circle.png')}
          style={styles.img}
        />
        <Spacer height={44} />
        <Text
          t4
          center
          i18n={I18N.signNotExitsTitle}
          i18params={{provider, email: email || ''}}
        />
        <Spacer height={5} />
        <Text
          t11
          color={Color.textBase2}
          center
          i18n={I18N.signNotExitsDescription}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          variant={ButtonVariant.contained}
          onPress={onPressCreate}
          i18n={I18N.signNotExitsCreateAccount}
        />
        <Button
          style={styles.button}
          variant={ButtonVariant.second}
          onPress={onPressChoice}
          i18n={I18N.signNotExitsChoiceAnother}
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
