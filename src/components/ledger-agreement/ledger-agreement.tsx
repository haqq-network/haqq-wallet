import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {LottieWrap} from '@app/components/lottie';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {Terms} from '@app/components/ui/terms';
import {createTheme, getWindowWidth} from '@app/helpers';
import {useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';
import {AppTheme} from '@app/types';

export type LedgerAgreementProps = {
  onDone: () => void;
};

export const LedgerAgreement = ({onDone}: LedgerAgreementProps) => {
  const theme = useTheme();

  const lottieAnimation = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('@assets/animations/body-ledger-dark.json');
    }
    return require('@assets/animations/body-ledger-light.json');
  }, [theme]);

  return (
    <PopupContainer style={page.container}>
      <View style={page.animation}>
        <LottieWrap source={lottieAnimation} style={page.image} autoPlay loop />
      </View>
      <Text t4 center style={page.title} i18n={I18N.ledgerAgreementTitle} />
      <Text
        t11
        color={Color.textBase2}
        center
        style={page.disclaimer}
        i18n={I18N.ledgerAgreementText}
      />
      <Spacer />
      <Button
        style={page.submit}
        variant={ButtonVariant.contained}
        i18n={I18N.ledgerAgreementAgree}
        onPress={onDone}
      />
      <Terms style={page.agreement} />
    </PopupContainer>
  );
};

const page = createTheme({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    justifyContent: 'center',
    alignItems: 'center',
    height: () => Math.min(getWindowWidth(), 330),
  },
  title: {
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  disclaimer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  agreement: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  image: {
    height: () => Math.min(getWindowWidth(), 330) - 20,
    width: 310,
  },
});
