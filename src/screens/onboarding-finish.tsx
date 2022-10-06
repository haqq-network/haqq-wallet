import React, {useCallback, useEffect, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  Container,
  Spacer,
  Title,
  LottieWrap,
} from '../components/ui';
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
  }, [navigation, route]);

  useEffect(() => {
    app.emit('modal', null);
  }, [app]);

  return (
    <Container>
      <Spacer>
        <LottieWrap
          source={require('../../assets/animations/success-animation.json')}
          autoPlay
          loop={false}
        />
      </Spacer>
      <Title style={page.title}>{title}</Title>
      <Button
        style={page.button}
        variant={ButtonVariant.contained}
        title="Finish"
        onPress={onEnd}
      />
    </Container>
  );
};

const page = StyleSheet.create({
  title: {marginBottom: 76},
  button: {marginBottom: 16},
});
