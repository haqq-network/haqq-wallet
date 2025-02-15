import React from 'react';

import {Image, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';
import {IS_IOS} from '@app/variables/common';

import {Button, ButtonVariant, Spacer, Text} from '../ui';

export interface KeystoneConnectionSteps {
  syncInProgress: boolean;
  onPressSync(): void;
  onPressTutorial(): void;
}

const KEYSTONE_CONNECTION_STEPS_COUNT = 3;

export const KeystoneConnectionSteps = ({
  syncInProgress,
  onPressSync,
  onPressTutorial,
}: KeystoneConnectionSteps) => {
  const keystoneConnectFrameImg = useThemeSelector({
    light: require('@assets/images/keystone-connect-frame-light.png'),
    dark: require('@assets/images/keystone-connect-frame-dark.png'),
  });

  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.flexOne} contentContainerStyle={styles.container}>
      <Text center t4 i18n={I18N.keystoneConnectionStepsTitle} />
      <Spacer height={32} />
      <Image source={keystoneConnectFrameImg} />
      <View style={styles.textContainer}>
        {[...Array(KEYSTONE_CONNECTION_STEPS_COUNT)].map(
          (_, index, {length}) => {
            const isLast = index === length - 1;
            return (
              <React.Fragment key={`keystone-connection-step-info-${index}`}>
                <View style={styles.stepContainer}>
                  <Text
                    t9
                    i18n={I18N.keystoneConnectionStepNumber}
                    i18params={{idx: `${index + 1}`}}
                  />
                  <Spacer width={16} />
                  <View style={styles.desctiptionText}>
                    <Text
                      t11
                      i18n={
                        // @ts-ignore
                        I18N[`keystoneConnectionStepDescription${index + 1}`]
                      }
                    />
                  </View>
                </View>
                {!isLast && <View style={styles.divider} />}
              </React.Fragment>
            );
          },
        )}
      </View>
      <Spacer flex={1} />
      <View style={styles.buttonContainer}>
        <Button
          onPress={onPressTutorial}
          variant={ButtonVariant.text}
          i18n={I18N.keystoneConnectionStepTutorial}
        />
        <Spacer height={10} />
        <Button
          disabled={syncInProgress}
          onPress={onPressSync}
          variant={ButtonVariant.contained}
          i18n={I18N.keystoneConnectionStepSync}
        />
      </View>
      <Spacer height={IS_IOS ? insets.bottom : 12} />
    </ScrollView>
  );
};

const styles = createTheme({
  flexOne: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  textContainer: {
    backgroundColor: Color.bg3,
    width: '100%',
    borderRadius: 11,
    padding: 20,
  },
  divider: {
    width: '100%',
    borderColor: Color.graphicSecond2,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  desctiptionText: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
  },
});
