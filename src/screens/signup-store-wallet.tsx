import React, {useEffect} from 'react';
import {View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {useApp} from '../contexts/app';
import {utils} from 'ethers';
import {MAIN_ACCOUNT_NAME} from '../variables';
import {sleep} from '../utils';

type SignupStoreWalletScreenProp = CompositeScreenProps<any, any>;

export const SignupStoreWalletScreen = ({
  navigation,
  route,
}: SignupStoreWalletScreenProp) => {
  const app = useApp();
  const wallets = useWallets();

  useEffect(() => {
    app.emit('modal', {type: 'loading', text: 'Creating a wallet'});
  }, [app, route.params.action]);

  useEffect(() => {
    setTimeout(async () => {
      const actions = [];

      if (route.params.action === 'create') {
        await wallets.addWalletFromMnemonic(
          utils.entropyToMnemonic(utils.randomBytes(16)),
          wallets.getSize() === 0
            ? MAIN_ACCOUNT_NAME
            : `Account #${wallets.getSize() + 1}`,
        );
      }

      actions.push(sleep(4000));

      Promise.all(actions).then(() => {
        navigation.navigate(route.params.nextScreen ?? 'onboarding-finish');
      });
    }, 250);
  }, [navigation, route.params.action, route.params.nextScreen, wallets]);

  return <View />;
};
