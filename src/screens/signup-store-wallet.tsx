import React, {useEffect} from 'react';
import {View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NextScreenT, RootStackParamList} from '../types';
import {useWallets} from '../contexts/wallets';
import {useApp} from '../contexts/app';
import {utils} from 'ethers';
import {MAIN_ACCOUNT_NAME} from '../variables';
import {sleep} from '../utils';

type ParamList = {
  createStoreWallet: {
    nextScreen: NextScreenT;
  };
};

export const SignupStoreWalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<ParamList, 'createStoreWallet'>>();
  const app = useApp();
  const wallets = useWallets();

  useEffect(() => {
    app.emit('modal', {type: 'loading', text: 'Creating a wallet'});
  }, [app]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const actions = [sleep(4000)];

      actions.push(
        wallets.addWalletFromMnemonic(
          utils.entropyToMnemonic(utils.randomBytes(16)),
          wallets.getSize() === 0
            ? MAIN_ACCOUNT_NAME
            : `Account #${wallets.getSize() + 1}`,
        ),
      );

      Promise.all(actions).then(() => {
        navigation.navigate(route.params.nextScreen ?? 'onboardingFinish');
      });
    });
  }, [navigation, route, wallets]);

  return <View />;
};
