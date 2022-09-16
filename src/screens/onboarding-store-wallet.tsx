import React, {useEffect} from 'react';
import {View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {useApp} from '../contexts/app';
import {utils} from 'ethers';
import {MAIN_ACCOUNT_NAME} from '../variables';

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
    setTimeout(async () => {
      if (route.params.action === 'create') {
        await wallets.addWalletFromMnemonic(
          utils.entropyToMnemonic(utils.randomBytes(16)),
          wallets.getSize() === 0
            ? MAIN_ACCOUNT_NAME
            : `Account #${wallets.getSize() + 1}`,
          false,
        );
      }

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
        navigation.navigate(route.params.nextScreen ?? 'onboarding-finish');
      });
    }, 250);
  }, [navigation, route.params.action, route.params.nextScreen, wallets]);

  return <View />;
};
