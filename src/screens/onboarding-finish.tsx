import React, {useCallback, useEffect, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  Container,
  Spacer,
  Text,
  LottieWrap,
} from '../components/ui';
import {useApp} from '../contexts/app';
import {useWallets} from '../contexts/wallets';

type OnboardingFinishScreenProp = CompositeScreenProps<any, any>;

export const OnboardingFinishScreen = ({
  navigation,
  route,
}: OnboardingFinishScreenProp) => {
  const app = useApp();
  const wallets = useWallets();
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
    requestAnimationFrame(async () => {
      await wallets.checkForBackup(app.snoozeBackup);
    });
  }, [app, navigation, route, wallets]);

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
      <Text t4 style={page.title}>
        {title}
      </Text>
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
