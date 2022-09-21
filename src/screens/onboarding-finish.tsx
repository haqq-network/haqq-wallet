import React, {useCallback, useEffect, useMemo} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {Button, ButtonVariant, Spacer, Title} from '../components/ui';
import Lottie from 'lottie-react-native';
import {useApp} from '../contexts/app';

type OnboardingFinishScreenProp = CompositeScreenProps<any, any>;

export const OnboardingFinishScreen = ({
  navigation,
  route,
}: OnboardingFinishScreenProp) => {
  const app = useApp();
  const title = useMemo(
    () =>
      route.params.action === 'create'
        ? 'Congratulations! You have successfully added a new wallet'
        : 'Congratulations! You have successfully recovered a wallet',
    [route.params.action],
  );

  const onEnd = useCallback(() => {
    if (route.params.hide) {
      navigation.getParent()?.goBack();
    } else {
      navigation.replace('home');
    }
  }, []);

  useEffect(() => {
    app.emit('modal', null);
  }, [app]);

  return (
    <Container>
      <Spacer>
        <Lottie
          source={require('../../assets/animations/success-animation.json')}
          autoPlay
          loop={false}
        />
      </Spacer>
      <Title style={{marginBottom: 76}}>{title}</Title>
      <Button
        style={{marginBottom: 16}}
        variant={ButtonVariant.contained}
        title="Finish"
        onPress={onEnd}
      />
    </Container>
  );
};
