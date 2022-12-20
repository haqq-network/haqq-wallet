import React, {useCallback} from 'react';

import {Text as RNText, StyleProp, StyleSheet, TextStyle} from 'react-native';

import {Color, getColor} from '@app/colors';

import {openURL} from '../../helpers';
import {I18N, getText} from '../../i18n';
import {LIGHT_GRAPHIC_GREEN_1, PRIVACY_POLICY} from '../../variables/common';
import {Text} from '../ui';

export type TermsProps = {
  style?: StyleProp<TextStyle> | undefined;
};

export const Terms = ({style}: TermsProps) => {
  const onPressPP = useCallback(() => {
    openURL(PRIVACY_POLICY);
  }, []);

  return (
    <Text t11 center color={getColor(Color.textBase2)} style={style}>
      {getText(I18N.termsAgreement)}{' '}
      <RNText onPress={onPressPP} style={styles.link}>
        {getText(I18N.termsPrivacyPolicy)}
      </RNText>
    </Text>
  );
};

const styles = StyleSheet.create({
  link: {
    color: LIGHT_GRAPHIC_GREEN_1,
  },
});
