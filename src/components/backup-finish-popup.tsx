import React, {useEffect} from 'react';
import {Dimensions, StyleSheet} from 'react-native';

import {HapticEffects, vibrate} from '@app/services/haptic';

import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import { I18N } from '@app/i18n';
import { createTheme } from '@app/helpers';

const animationSize = Dimensions.get('window').width - 116;

interface BackUpFinishPopUp {
  onSubmit?: () => void;
}

export const BackUpFinishPopUp = ({onSubmit = () => {}}: BackUpFinishPopUp) => {
  

  useEffect(() => {
    vibrate(HapticEffects.success);
  }, []);

  return (
    <PopupContainer style={styles.popupContainer}>
      <Spacer style={styles.container}>
        <LottieWrap
          source={require('../../assets/animations/backup-success-animation.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />
      </Spacer>
      <Text t4 center i18n={I18N.backupFinishCongratulation}/>
      <Text t4 center i18n={I18N.backupFinishSuccess} style={styles.title}/>
      <Button
        style={styles.button}
        variant={ButtonVariant.contained}
        i18n={I18N.backupFinishFinish}
        onPress={onSubmit}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  popupContainer: {marginHorizontal: 20},
  container: {justifyContent: 'center', alignItems: 'center'},
  title: {marginBottom: 40},
  button: {marginVertical: 16},
  animation:{width: animationSize, height: animationSize}
});
