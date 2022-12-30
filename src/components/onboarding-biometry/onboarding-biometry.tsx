import React, {useMemo} from 'react';

import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  ErrorText,
  FaceIdIcon,
  FingerprintIcon,
  PopupContainer,
  Spacer,
  Text,
  TouchIdIcon,
} from '@app/components/ui';
import {useTheme} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {BiometryType} from '@app/types';
import {BIOMETRY_TYPES_NAMES} from '@app/variables/common';

interface OnboardingBiometryProps {
  onClickSkip: () => void;
  onClickEnable: () => void;
  biometryType: BiometryType;
  error: string;
}

export const OnboardingBiometry = ({
  onClickSkip,
  onClickEnable,
  biometryType,
  error,
}: OnboardingBiometryProps) => {
  const {colors} = useTheme();
  const enableBiometry = getText(I18N.onboardingBiometryEnable, {
    biometry: BIOMETRY_TYPES_NAMES[biometryType],
  });

  const icon = useMemo(() => {
    switch (biometryType) {
      case BiometryType.faceId:
        return <FaceIdIcon color={colors.graphicBase1} style={styles.icon} />;
      case BiometryType.touchId:
        return <TouchIdIcon color={colors.graphicBase1} style={styles.icon} />;
      case BiometryType.fingerprint:
        return (
          <FingerprintIcon color={colors.graphicBase1} style={styles.icon} />
        );
      default:
        return null;
    }
  }, [biometryType, colors]);

  return (
    <PopupContainer style={styles.container}>
      <Spacer style={styles.space}>
        {icon}
        <Text t4 style={styles.title} testID="onboarding_biometry_title">
          {enableBiometry}
        </Text>
        <Text
          t11
          color={Color.textBase2}
          i18n={I18N.onboardingBiometrySafeFast}
          center
        />
        {error && (
          <ErrorText e2 center style={styles.error}>
            {error}
          </ErrorText>
        )}
      </Spacer>
      <Button
        style={styles.margin}
        variant={ButtonVariant.contained}
        title={enableBiometry}
        testID="onboarding_biometry_enable"
        onPress={onClickEnable}
      />
      <Button
        style={styles.margin}
        i18n={I18N.onboardingBiometrySkip}
        testID="onboarding_biometry_skip"
        onPress={onClickSkip}
      />
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  container: {marginHorizontal: 20},
  title: {marginBottom: 12},
  space: {justifyContent: 'center', alignItems: 'center'},
  icon: {marginBottom: 40},
  margin: {marginBottom: 16},
  error: {top: 20},
});
