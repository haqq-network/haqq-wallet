import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '../ui';
import {TEXT_BASE_2} from '../../variables';
import {windowHeight, windowWidth} from '../../helpers';
// import {Terms} from '../ui/terms';
import {getText, I18N} from '../../i18n';

export type RestoreAgreementProps = {
  onDone: () => void;
  testID?: string;
};

export const RestoreAgreement = ({onDone, testID}: RestoreAgreementProps) => {
  return (
    <PopupContainer style={page.container} testID={testID}>
      <View style={page.animation}>
        <LottieWrap
          source={require('../../../assets/animations/recover-animation.json')}
          style={page.image}
          autoPlay
          resizeMode="center"
          loop
        />
      </View>
      <Text t4 style={page.title}>
        {getText(I18N.restoreAgreementTitle)}
      </Text>
      <Text t11 style={page.disclaimer}>
        {getText(I18N.restoreAgreementText)}
      </Text>
      <Spacer />
      <Button
        style={page.submit}
        variant={ButtonVariant.contained}
        title={getText(I18N.restoreAgreementAgree)}
        testID={`${testID}_agree`}
        onPress={onDone}
      />
      {/*<Terms style={page.agreement} />*/}
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    height: Math.min(windowWidth, windowHeight * 0.355),
    width: windowWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  disclaimer: {
    textAlign: 'center',
    color: TEXT_BASE_2,
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  // agreement: {
  //   marginHorizontal: 20,
  //   marginBottom: 16,
  // },
  image: {
    height: Math.min(windowWidth, windowHeight * 0.355) - 20,
    margin: 10,
    top: -10,
  },
});
