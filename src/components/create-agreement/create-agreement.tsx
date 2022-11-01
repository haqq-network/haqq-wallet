import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {Button, ButtonVariant, PopupContainer, Text} from '../ui';
import {TEXT_BASE_2} from '../../variables';
import {LottieWrap} from '../lottie';
import {getText, I18N} from '../../i18n';
// import {Terms} from '../ui/terms';

export type CreateAgreementProps = {
  onDone: () => void;
  testID?: string;
};
const windowWidth = Dimensions.get('window').width;

export const CreateAgreement = ({onDone, testID}: CreateAgreementProps) => {
  return (
    <>
      <View pointerEvents="none" style={page.animation}>
        <LottieWrap
          source={require('../../../assets/animations/first-screen-animation.json')}
          autoPlay
          loop={false}
        />
      </View>
      <PopupContainer style={page.container} testID={testID}>
        <Text t4 style={page.title}>
          {getText(I18N.createAgreementTitle)}
        </Text>
        <Text t11 style={page.disclaimer}>
          {getText(I18N.createAgreementText)}
        </Text>
        <Button
          testID={`${testID}_agree`}
          style={page.submit}
          variant={ButtonVariant.contained}
          title={getText(I18N.createAgreementAgree)}
          onPress={onDone}
        />
        {/*<Terms style={page.agreement} />*/}
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
    width: windowWidth,
    height: windowWidth,
    top: -34,
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  disclaimer: {
    marginBottom: 84,
    textAlign: 'center',
    color: TEXT_BASE_2,
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  // agreement: {
  //   marginHorizontal: 20,
  //   marginBottom: 16,
  // },
});
