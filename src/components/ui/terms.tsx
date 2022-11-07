import React, {useCallback} from 'react';

import {Text as RNText, StyleProp, TextStyle} from 'react-native';

import {Color} from '../../colors';
import {openURL} from '../../helpers';
import {createTheme} from '../../helpers/create-theme';
import {I18N, getText} from '../../i18n';
import {PRIVACY_POLICY} from '../../variables';
import {Text} from '../ui';

export type TermsProps = {
  style?: StyleProp<TextStyle> | undefined;
};

export const Terms = ({style}: TermsProps) => {
  const onPressPP = useCallback(() => {
    openURL(PRIVACY_POLICY);
  }, []);

  return (
    <Text t11 style={[styles.agreement, style]}>
      {getText(I18N.termsAgreement)}{' '}
      <RNText onPress={onPressPP} style={styles.link}>
        {getText(I18N.termsPrivacyPolicy)}
      </RNText>
    </Text>
  );
};

const styles = createTheme({
  agreement: {
    textAlign: 'center',
    color: Color.textBase2,
  },
  link: {
    color: Color.graphicGreen1,
  },
});
