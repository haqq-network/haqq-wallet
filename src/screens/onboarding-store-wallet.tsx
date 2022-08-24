import React, {useEffect} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {View} from 'react-native';

type OnboardingStoreWalletScreenProp = CompositeScreenProps<any, any>;

export const OnboardingStoreWalletScreen = ({
  navigation,
}: OnboardingStoreWalletScreenProp) => {
  const wallets = useWallets();

  useEffect(() => {
    requestAnimationFrame(() => {
      Promise.all(
        wallets
          .getWallets()
          .filter(w => !w.saved)
          .map(w => wallets.saveWallet(w)),
      ).then(() => navigation.navigate('onboarding-finish'));
    });
  }, [navigation, wallets]);

  return <View />;
};
