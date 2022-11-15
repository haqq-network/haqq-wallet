import React, {useEffect} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View} from 'react-native';

import {useWallets} from '@app/hooks';

import {captureException} from '../helpers';
import {showModal} from '../helpers/modal';
import {generateMnemonic} from '../services/eth-utils';
import {RootStackParamList} from '../types';
import {MAIN_ACCOUNT_NAME} from '../variables';

export const SignupStoreWalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'createStoreWallet'>>();

  const wallets = useWallets();

  useEffect(() => {
    showModal('loading', {text: 'Creating a wallet'});
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      try {
        const mnemonic = await generateMnemonic();

        await wallets.addWalletFromMnemonic(
          mnemonic,
          wallets.getSize() === 0
            ? MAIN_ACCOUNT_NAME
            : `Account #${wallets.getSize() + 1}`,
        );

        navigation.navigate(route.params.nextScreen ?? 'onboardingFinish');
      } catch (error) {
        switch (error) {
          case 'wallet_already_exists':
            showModal('error-account-added');
            navigation.getParent()?.goBack();
            break;
          default:
            if (error instanceof Error) {
              showModal('error-create-account');
              captureException(error, 'createStoreWallet');
              navigation.getParent()?.goBack();
            }
        }
      }
    }, 350);
  }, [navigation, route, wallets]);

  return <View />;
};
