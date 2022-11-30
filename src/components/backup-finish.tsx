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
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

type BackupFinishProps = {
  onSubmit: () => void;
};

export const BackupFinish = ({onSubmit}: BackupFinishProps) => {
  const animationSize = useWindowDimensions().width - 116;
  useEffect(() => {
    vibrate(HapticEffects.success);
  }, []);

  return (
    <PopupContainer style={page.popupContainer}>
      <Spacer style={page.container}>
        <LottieWrap
          source={require('../../assets/animations/backup-success-animation.json')}
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
