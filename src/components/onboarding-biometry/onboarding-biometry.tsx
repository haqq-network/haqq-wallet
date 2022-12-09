import React, {useCallback, useMemo, useState} from 'react';

import {StyleSheet} from 'react-native';

import {Color, getColor} from '@app/colors';
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
import {useApp} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {BiometryType} from '@app/types';
import {BIOMETRY_TYPES_NAMES} from '@app/variables';

interface OnboardingBiometryProps {
  onClickSkip: () => void;
  onClickEnable: () => void;
  biometryType: BiometryType;
  error: string
}

export const OnboardingBiometry = ({
  onClickSkip,
  onClickEnable,
  biometryType,
  error,
}: OnboardingBiometryProps) => {
  const enableBiometry = getText(I18N.onboardingBiometryEnable, {
    biometry: BIOMETRY_TYPES_NAMES[biometryType],
  });

  const icon = useMemo(() => {
    switch (biometryType) {
      case BiometryType.faceId:
        return <FaceIdIcon color={Color.graphicBase1} style={style.icon} />;
      case BiometryType.touchId:
        return <TouchIdIcon color={Color.graphicBase1} style={style.icon} />;
      case BiometryType.fingerprint:
        return (
          <FingerprintIcon
            color={getColor(Color.graphicBase1)}
            style={style.icon}
          />
        );
      default:
        return null;
    }
  }, [biometryType]);

  return (
    <PopupContainer style={style.container}>
      <Spacer style={style.space}>
        {icon}
        <Text t4 style={style.title} testID="onboarding_biometry_title">
          {enableBiometry}
        </Text>
        <Text
          t11
          color={Color.textBase2}
          i18n={I18N.onboardingBiometrySafeFast}
          center={true}
        />
        {error && (
          <ErrorText e2 center={true} style={style.error}>
            {error}
          </ErrorText>
        )}
      </Spacer>
      <Button
        style={style.margin}
        variant={ButtonVariant.contained}
        title={enableBiometry}
        testID="onboarding_biometry_enable"
        onPress={onClickEnable}
      />
      <Button
        style={style.margin}
        i18n={I18N.onboardingBiometrySkip}
        testID="onboarding_biometry_skip"
        onPress={onClickSkip}
      />
    </PopupContainer>
  );
};

const style = StyleSheet.create({
  container: {marginHorizontal: 20},
  title: {marginBottom: 12},
  space: {justifyContent: 'center', alignItems: 'center'},
  icon: {marginBottom: 40},
  margin: {marginBottom: 16},
  error: {top: 20},
});
