import React, {useEffect} from 'react';

import {useWindowDimensions} from 'react-native';

import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {createTheme, useThemeSelector} from '@app/theme';

type BackupFinishProps = {
  onSubmit: () => void;
  testID?: string;
};

export const BackupFinish = ({onSubmit, testID}: BackupFinishProps) => {
  const animationSize = useWindowDimensions().width - 116;
  useEffect(() => {
    vibrate(HapticEffects.success);
  }, []);

  const animation = useThemeSelector({
    dark: require('@assets/animations/backup-success-dark.json'),
    light: require('@assets/animations/backup-success-light.json'),
  });

  return (
    <PopupContainer style={page.popupContainer} testID={testID}>
      <Spacer style={page.container}>
        <LottieWrap
          source={animation}
          autoPlay
          loop={false}
          style={{width: animationSize, height: animationSize}}
        />
      </Spacer>
      <Text t4 center i18n={I18N.backupFinishCongratulation} />
      <Text t4 center i18n={I18N.backupFinishSuccess} style={page.title} />
      <Button
        style={page.button}
        variant={ButtonVariant.contained}
        i18n={I18N.backupFinishFinish}
        onPress={onSubmit}
        testID={`${testID}_finish`}
      />
    </PopupContainer>
  );
};

const page = createTheme({
  popupContainer: {marginHorizontal: 20},
  container: {justifyContent: 'center', alignItems: 'center'},
  title: {marginBottom: 40},
  button: {marginVertical: 16},
});
