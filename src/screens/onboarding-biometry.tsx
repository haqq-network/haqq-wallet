import React, {useCallback, useState} from 'react';
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

  return (
    <Container>
      <Spacer style={{justifyContent: 'center', alignItems: 'center'}}>
        {biometryIcons[biometryType] && (
          <Icon name={biometryIcons[biometryType]} style={{marginBottom: 40}} />
        )}
        <Title style={{marginBottom: 12}}>
          Enable {biometryTypes[biometryType]}
        </Title>
        <Paragraph style={{textAlign: 'center'}}>Safe and fast</Paragraph>
        {error && <Paragraph>{error}</Paragraph>}
      </Spacer>
      <Button
        style={{marginBottom: 16}}
        variant={ButtonVariant.contained}
        title={`Enable ${biometryTypes[biometryType]}`}
        onPress={onClickEnable}
      />
      <Button style={{marginBottom: 16}} title="Skip" onPress={onClickSkip} />
    </Container>
  );
};
