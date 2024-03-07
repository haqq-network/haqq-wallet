import React from 'react';

import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {RiveWrapper} from '@app/components/ui/rive-wrapper';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Color} from '@app/theme';
import {IS_IOS} from '@app/variables/common';

import {Button, ButtonVariant, First, Spacer, Text} from '../ui';

export interface KeystoneConnectionStepsProps {
  syncInProgress: boolean;
  isPermissionDenied: boolean;
  onPressContinue(): void;
  onPressSettings(): void;
}

export const KeystoneCameraPermission = ({
  syncInProgress,
  isPermissionDenied,
  onPressContinue,
  onPressSettings,
}: KeystoneConnectionStepsProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <View style={styles.animationWrapper}>
        <RiveWrapper
          width={375}
          height={310}
          resourceName={'animated_camera'}
          autoplay={true}
        />
      </View>
      <Spacer height={20} />
      <First>
        {isPermissionDenied && (
          <View>
            <Text t4 center i18n={I18N.keystoneCameraPermissionDeniedTitle} />
            <Spacer height={4} />
            <Text
              t11
              color={Color.textBase2}
              center
              i18n={I18N.keystoneCameraPermissionDeniedDescription}
            />
          </View>
        )}
        <View>
          <Text t4 center i18n={I18N.keystoneCameraPermissionRequestTitle} />
          <Spacer height={4} />
          <Text
            t11
            color={Color.textBase2}
            center
            i18n={I18N.keystoneCameraPermissionRequestDescription}
          />
        </View>
      </First>
      <Spacer flex={1} />
      <View style={styles.buttonContainer}>
        <First>
          {isPermissionDenied && (
            <Button
              disabled={syncInProgress}
              onPress={onPressSettings}
              variant={ButtonVariant.second}
              i18n={I18N.keystoneCameraPermissionOpenSettings}
            />
          )}
          <Button
            disabled={syncInProgress}
            onPress={onPressContinue}
            variant={ButtonVariant.contained}
            i18n={I18N.continue}
          />
        </First>
        <Spacer height={IS_IOS ? insets.bottom : 12} />
      </View>
    </View>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  animationWrapper: {
    marginTop: 20,
    width: 375,
    height: 310,
  },
  buttonContainer: {
    width: '100%',
  },
});
