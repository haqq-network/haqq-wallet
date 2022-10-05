import React, {useCallback, useState} from 'react';
import {StyleSheet} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  Container,
  Icon,
  Paragraph,
  Spacer,
  Title,
} from '../components/ui';
import {useApp} from '../contexts/app';

type OnboardingBiometryScreenProps = CompositeScreenProps<any, any>;

const biometryTypes: Record<string, string> = {
  FaceID: 'Face ID',
};

const biometryIcons: Record<string, string> = {
  FaceID: 'face-id',
};

export const OnboardingBiometryScreen = ({
  navigation,
  route,
}: OnboardingBiometryScreenProps) => {
  const {biometryType} = route.params;
  const app = useApp();
  const [error, setError] = useState('');

  const onClickSkip = useCallback(() => {
    requestAnimationFrame(() => {
      navigation.navigate('onboarding-store-wallet');
    });
  }, [navigation]);

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

  return (
    <Container>
      <Spacer style={page.space}>
        {biometryIcons[biometryType] && (
          <Icon name={biometryIcons[biometryType]} style={page.icon} />
        )}
        <Title style={page.title}>Enable {biometryTypes[biometryType]}</Title>
        <Paragraph style={page.textStyle}>Safe and fast</Paragraph>
        {error && <Paragraph>{error}</Paragraph>}
      </Spacer>
      <Button
        style={page.margin}
        variant={ButtonVariant.contained}
        title={`Enable ${biometryTypes[biometryType]}`}
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
  textStyle: {textAlign: 'center'},
  margin: {marginBottom: 16},
});
