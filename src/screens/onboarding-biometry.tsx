import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  Container,
  FaceIdIcon,
  FingerprintIcon,
  Spacer,
  Text,
  TouchIdIcon,
} from '../components/ui';
import {useApp} from '../contexts/app';
import {BIOMETRY_TYPES_NAMES, TEXT_BASE_2} from '../variables';
import {BiometryType} from '../types';

type OnboardingBiometryScreenProps = CompositeScreenProps<any, any>;

export const OnboardingBiometryScreen = ({
  navigation,
  route,
}: OnboardingBiometryScreenProps) => {
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
        return <FaceIdIcon />;
      case BiometryType.touchId:
        return <TouchIdIcon />;
      case BiometryType.fingerprint:
        return <FingerprintIcon />;
      default:
        return null;
    }
  }, [biometryType]);

  return (
    <Container>
      <Spacer style={page.space}>
        {icon}
        <Text t4 style={page.title}>
          Enable {BIOMETRY_TYPES_NAMES[biometryType]}
        </Text>
        <Text t11 style={page.textStyle}>
          Safe and fast
        </Text>
        {error && <Text clean>{error}</Text>}
      </Spacer>
      <Button
        style={page.margin}
        variant={ButtonVariant.contained}
        title={`Enable ${BIOMETRY_TYPES_NAMES[biometryType]}`}
        onPress={onClickEnable}
      />
      <Button style={page.margin} title="Skip" onPress={onClickSkip} />
    </Container>
  );
};

const page = StyleSheet.create({
  title: {marginBottom: 12},
  space: {justifyContent: 'center', alignItems: 'center'},
  icon: {marginBottom: 40},
  textStyle: {textAlign: 'center', color: TEXT_BASE_2},
  margin: {marginBottom: 16},
});
