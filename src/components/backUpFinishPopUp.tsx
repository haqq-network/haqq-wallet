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
import { useTypedNavigation } from '@app/hooks';
import { I18N } from '@app/i18n';

const animationSize = Dimensions.get('window').width - 116;

export const BackUpFinishPopUp = () => {
  const navigation = useTypedNavigation();

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
      <Text t4 center i18n={I18N.backupFinishcongrat}/>
      <Text t4 center i18n={I18N.backupFinishSuccess} style={page.title}/>
      <Button
        style={page.button}
        variant={ButtonVariant.contained}
        i18n={I18N.backupFinishFinish}
        onPress={() => {
          navigation.getParent()?.goBack();
        }}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  popupContainer: {marginHorizontal: 20},
  container: {justifyContent: 'center', alignItems: 'center'},
  title: {marginBottom: 40},
  button: {marginVertical: 16},
});
