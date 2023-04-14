import React from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {openURL} from '@app/helpers';
import {I18N} from '@app/i18n';
import {PRIVACY_POLICY, TERMS_OF_CONDITIONS} from '@app/variables/common';

interface TermsProps {
  style?: StyleProp<ViewStyle>;
}

export const Terms = ({style}: TermsProps) => {
  const onPressPP = () => {
    openURL(PRIVACY_POLICY);
  };

  const onPressTOS = () => {
    openURL(TERMS_OF_CONDITIONS);
  };

  return (
    <View style={[styles.container, style]}>
      <Text t11 i18n={I18N.termsAgreementFirst} color={Color.textBase2} />
      <Text
        onPress={onPressTOS}
        t11
        i18n={I18N.termsOfService}
        color={Color.textGreen1}
      />
      <Text t11 i18n={I18N.termsAgreementSecond} color={Color.textBase2} />
      <Text
        onPress={onPressPP}
        t11
        i18n={I18N.termsPrivacyPolicy}
        color={Color.textGreen1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
