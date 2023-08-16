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
import {Terms} from '@app/components/ui/terms';
import {createTheme, getWindowHeight, getWindowWidth} from '@app/helpers';
import {I18N} from '@app/i18n';

export type CreateAgreementProps = {
  onDone: () => void;
  testID?: string;
};

const calculateHeight = () =>
  Math.min(getWindowWidth(), getWindowHeight() * 0.355);

export const CreateAgreement = ({onDone, testID}: CreateAgreementProps) => {
  return (
    <PopupContainer style={styles.container} testID={testID}>
      <View pointerEvents="none" style={styles.animation}>
        <LottieWrap
          source={require('@assets/animations/first-screen-animation.json')}
          autoPlay
          loop={false}
          resizeMode="contain"
          style={styles.animationInner}
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
      <Terms style={styles.agreement} />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    height: () => calculateHeight(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationInner: {
    height: () => calculateHeight() - 20,
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
  },
  disclaimer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  submit: {
    marginBottom: 16,
    marginHorizontal: 20,
  },
  agreement: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
});
