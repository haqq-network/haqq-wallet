import React from 'react';

import {StyleSheet, View, useWindowDimensions} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {I18N} from '@app/i18n';
// import {Terms} from '@app/components/ui/terms';

export type CreateAgreementProps = {
  onDone: () => void;
  testID?: string;
};

export const CreateAgreement = ({onDone, testID}: CreateAgreementProps) => {
  const animation = require('../../../assets/animations/first-screen-animation.json');
  const {height: windowHeight, width: windowWidth} = useWindowDimensions();
  const calculatedHeight = Math.min(windowWidth, windowHeight * 0.355);
  const animationHeight = {
    height: calculatedHeight,
  };
  const imageHeight = {
    height: calculatedHeight - 20,
  };

  return (
    <PopupContainer style={styles.container} testID={testID}>
      <View pointerEvents="none" style={[styles.animation, animationHeight]}>
        <LottieWrap
          source={animation}
          autoPlay
          loop={false}
          resizeMode="contain"
          style={imageHeight}
        />
      </View>
      <Text t4 center style={styles.title} i18n={I18N.createAgreementTitle} />
      <Text
        t11
        center
        style={styles.disclaimer}
        i18n={I18N.createAgreementText}
        color={Color.textBase2}
      />
      <Spacer />
      <Button
        testID={`${testID}_agree`}
        style={styles.submit}
        variant={ButtonVariant.contained}
        i18n={I18N.createAgreementAgree}
        onPress={onDone}
      />
      {/*<Terms style={styles.agreement} />*/}
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
  },
  disclaimer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
});
