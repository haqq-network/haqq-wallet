import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, ButtonVariant, LottieWrap, PopupContainer, Text} from '../ui';
import {TEXT_BASE_2} from '../../variables';
import {ratio, windowWidth} from '../../helpers';
import {Terms} from '../ui/terms';
import {getText, I18N} from '../../i18n';

export type RestoreAgreementProps = {
  onDone: () => void;
  testID?: string;
};

export const RestoreAgreement = ({onDone, testID}: RestoreAgreementProps) => {
  return (
    <>
      <View style={page.animation}>
        <LottieWrap
          source={require('../../../assets/animations/recover-animation.json')}
          style={page.image}
          autoPlay
          loop
        />
      </View>
      <PopupContainer style={page.container} testID={testID}>
        <Text t4 style={page.title}>
          {getText(I18N.restoreAgreementTitle)}
        </Text>
        <Text t11 style={page.disclaimer}>
          {getText(I18N.restoreAgreementText)}
        </Text>
        <Button
          style={page.submit}
          variant={ButtonVariant.contained}
          title={getText(I18N.restoreAgreementAgree)}
          testID={`${testID}_agree`}
          onPress={onDone}
        />
        <Terms style={page.agreement} />
      </PopupContainer>
    </>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 200,
    top: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
    textAlign: 'center',
    top: 50,
  },
  disclaimer: {
    top: 50,
    marginBottom: 154,
    textAlign: 'center',
    color: TEXT_BASE_2,
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  agreement: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  image: {
    top: 10,
    width: windowWidth,
    height: 362 * ratio,
    alignSelf: 'center',
  },
});
