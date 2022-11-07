import React, {useCallback, useMemo, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {Color, getColor} from '../colors';
import {
  Button,
  ButtonVariant,
  FaceIdIcon,
  FingerprintIcon,
  PopupContainer,
  Spacer,
  Text,
  TouchIdIcon,
} from '../components/ui';
import {useApp} from '../contexts/app';
import {createTheme} from '../helpers/create-theme';
import {BiometryType, RootStackParamList} from '../types';
import {BIOMETRY_TYPES_NAMES} from '../variables';

export const OnboardingBiometryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'onboardingBiometry'>>();
  const {biometryType} = route.params;
  const app = useApp();
  const [error, setError] = useState('');

  const onClickSkip = useCallback(() => {
    requestAnimationFrame(() => {
      const {nextScreen, ...params} = route.params;
      navigation.navigate(nextScreen ?? 'signupStoreWallet', params);
    });
  }, [route, navigation]);

  const onClickEnable = useCallback(async () => {
    try {
      await app.biometryAuth();
      app.biometry = true;
      onClickSkip();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  }, [app, onClickSkip]);

  const icon = useMemo(() => {
    switch (biometryType) {
      case BiometryType.faceId:
        return (
          <FaceIdIcon color={getColor(Color.graphicBase1)} style={page.icon} />
        );
      case BiometryType.touchId:
        return (
          <TouchIdIcon color={getColor(Color.graphicBase1)} style={page.icon} />
        );
      case BiometryType.fingerprint:
        return (
          <FingerprintIcon
            color={getColor(Color.graphicBase1)}
            style={page.icon}
          />
        );
      default:
        return null;
    }
  }, [biometryType]);

  return (
    <PopupContainer style={page.container}>
      <Spacer style={page.space}>
        {icon}
        <Text t4 style={page.title} testID="onboarding_biometry_title">
          Enable {BIOMETRY_TYPES_NAMES[biometryType]}
        </Text>
        <Text t11 style={page.textStyle}>
          Safe and fast
        </Text>
        {error && (
          <Text t11 style={page.error}>
            {error}
          </Text>
        )}
      </Spacer>
      <Button
        style={page.margin}
        variant={ButtonVariant.contained}
        title={`Enable ${BIOMETRY_TYPES_NAMES[biometryType]}`}
        testID="onboarding_biometry_enable"
        onPress={onClickEnable}
      />
      <Button
        style={page.margin}
        title="Skip"
        testID="onboarding_biometry_skip"
        onPress={onClickSkip}
      />
    </PopupContainer>
  );
};

const page = createTheme({
  container: {marginHorizontal: 20},
  title: {marginBottom: 12},
  space: {justifyContent: 'center', alignItems: 'center'},
  icon: {marginBottom: 40},
  textStyle: {textAlign: 'center', color: Color.textBase2},
  margin: {marginBottom: 16},
  error: {top: 20, textAlign: 'center', color: Color.textRed1},
});
