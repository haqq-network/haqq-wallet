import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, windowHeight, windowWidth} from '@app/helpers';
import {I18N} from '@app/i18n';
// import {Terms} from '../ui/terms';

export type CreateAgreementProps = {
  onDone: () => void;
  testID?: string;
};

export const CreateAgreement = ({onDone, testID}: CreateAgreementProps) => {
  const animation = require('../../../assets/animations/first-screen-animation.json');

  return (
    <PopupContainer style={styles.container} testID={testID}>
      <View pointerEvents="none" style={styles.animation}>
        <LottieWrap
          source={animation}
          autoPlay
          loop={false}
          resizeMode="center"
          style={styles.image}
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
      {/*<Terms style={page.agreement} />*/}
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    justifyContent: 'center',
    alignItems: 'center',
    height: Math.min(windowWidth, windowHeight * 0.355),
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
  image: {
    height: Math.min(windowWidth, windowHeight * 0.355) - 20,
  },
});
