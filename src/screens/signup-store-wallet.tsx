import React, {useEffect} from 'react';
import {View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useWallets} from '../contexts/wallets';
import {MAIN_ACCOUNT_NAME} from '../variables';
import {showModal} from '../helpers/modal';
import {captureException} from '../helpers';
import {generateMnemonic} from '../services/eth-utils';

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

        console.log('mnemonic', mnemonic);

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
