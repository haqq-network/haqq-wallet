import React, {useEffect} from 'react';
import {View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {useApp} from '../contexts/app';

type OnboardingStoreWalletScreenProp = CompositeScreenProps<any, any>;

export const OnboardingStoreWalletScreen = ({
  navigation,
  route,
}: OnboardingStoreWalletScreenProp) => {
  const app = useApp();
  const wallets = useWallets();

  useEffect(() => {
    const text =
      route.params.action === 'create'
        ? 'Creating a wallet'
        : 'Wallet recovery in progress';

    app.emit('modal', {type: 'loading', text});
  }, [app, route.params.action]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const actions = wallets
        .getWallets()
        .filter(w => !w.saved)
        .map(w => wallets.saveWallet(w));

      actions.push(
        new Promise(resolve => {
          setTimeout(() => resolve(), 4000);
        }),
      );

      Promise.all(actions).then(() => {
        navigation.navigate('onboarding-finish');
      });
    });
  }, [navigation, route.params.action, wallets]);

  return <View />;
};
