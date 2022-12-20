import React, {useMemo} from 'react';

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
import {createTheme} from '@app/helpers';
import {useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';
import {AppTheme} from '@app/types';
import {WINDOW_HEIGHT, WINDOW_WIDTH} from '@app/variables/common';

// import {Terms} from '../ui/terms';

export type RestoreAgreementProps = {
  onDone: () => void;
  testID?: string;
};

export const RestoreAgreement = ({onDone, testID}: RestoreAgreementProps) => {
  const theme = useTheme();

  const animation = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('../../../assets/animations/backup-start-dark.json');
    }

    return require('../../../assets/animations/backup-start-light.json');
  }, [theme]);

  return (
    <PopupContainer style={styles.container} testID={testID}>
      <View style={styles.animation}>
        <LottieWrap
          source={animation}
          style={styles.image}
          autoPlay
          resizeMode="center"
          loop
        />
      </View>
      <Text t4 center i18n={I18N.restoreAgreementTitle} style={styles.title} />
      <Text
        t11
        center
        style={styles.disclaimer}
        color={Color.textBase2}
        i18n={I18N.restoreAgreementText}
      />
      <Spacer />
      <Button
        style={styles.submit}
        variant={ButtonVariant.contained}
        i18n={I18N.restoreAgreementAgree}
        testID={`${testID}_agree`}
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
    height: Math.min(WINDOW_WIDTH, WINDOW_HEIGHT * 0.355),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
  },
  disclaimer: {
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  // agreement: {
  //   marginHorizontal: 20,
  //   marginBottom: 16,
  // },
  image: {
    height: Math.min(WINDOW_WIDTH, WINDOW_HEIGHT * 0.355) - 20,
    top: -10,
  },
});
