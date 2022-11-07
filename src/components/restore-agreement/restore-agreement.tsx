import React, {useMemo} from 'react';

import {View} from 'react-native';

// import {Terms} from '../ui/terms';
import {Color} from '../../colors';
import {windowHeight, windowWidth} from '../../helpers';
import {createTheme} from '../../helpers/create-theme';
import {useTheme} from '../../hooks/use-theme';
import {I18N, getText} from '../../i18n';
import {AppTheme} from '../../types';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '../ui';

export type RestoreAgreementProps = {
  onDone: () => void;
  testID?: string;
};

export const RestoreAgreement = ({onDone, testID}: RestoreAgreementProps) => {
  const theme = useTheme();
  const animation = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('../../../assets/animations/recover-animation-dark.json');
    }

    return require('../../../assets/animations/recover-animation-light.json');
  }, [theme]);

  return (
    <PopupContainer style={page.container} testID={testID}>
      <View style={page.animation}>
        <LottieWrap
          source={animation}
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

const page = createTheme({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    height: Math.min(windowWidth, windowHeight * 0.355),
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
    color: Color.textBase2,
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  // agreement: {
  //   marginHorizontal: 20,
  //   marginBottom: 16,
  // },
  image: {
    height: Math.min(windowWidth, windowHeight * 0.355) - 20,
    top: -10,
  },
});
