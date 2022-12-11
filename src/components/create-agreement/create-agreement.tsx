import React from 'react';

import {Dimensions, View} from 'react-native';

import {createTheme, windowHeight} from '../../helpers';
import {I18N, getText} from '../../i18n';
import {LottieWrap} from '../lottie';
import {Button, ButtonVariant, PopupContainer, Spacer, Text} from '../ui';
// import {Terms} from '../ui/terms';

export type CreateAgreementProps = {
  onDone: () => void;
  testID?: string;
};
const windowWidth = Dimensions.get('window').width;

export const CreateAgreement = ({onDone, testID}: CreateAgreementProps) => {
  return (
    <PopupContainer style={page.container} testID={testID}>
      <View pointerEvents="none" style={page.animation}>
        <LottieWrap
          source={require('../../../assets/animations/first-screen-animation.json')}
          autoPlay
          loop={false}
          style={page.image}
        />
      </View>
      <Text t4 style={page.title}>
        {getText(I18N.createAgreementTitle)}
      </Text>
      <Text t11 style={page.disclaimer}>
        {getText(I18N.createAgreementText)}
      </Text>
      <Spacer />
      <Button
        testID={`${testID}_agree`}
        style={page.submit}
        variant={ButtonVariant.contained}
        title={getText(I18N.createAgreementAgree)}
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
