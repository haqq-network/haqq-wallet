import React, {useEffect} from 'react';
import {View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useWallets} from '../contexts/wallets';
import {MAIN_ACCOUNT_NAME} from '../variables';
import {showModal} from '../helpers/modal';
import {captureException} from '../helpers';

export const SigninStoreWalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'restoreStore'>>();
  const wallets = useWallets();

  useEffect(() => {
    showModal('loading', {
      text: 'Wallet recovery in progress',
    });
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      try {
        const name =
          wallets.getSize() === 0
            ? MAIN_ACCOUNT_NAME
            : `Account #${wallets.getSize() + 1}`;

        if (route.params.mnemonic) {
          await wallets
            .addWalletFromMnemonic(route.params.mnemonic, name)
            .then(wallet => {
              if (wallet) {
                wallet.mnemonicSaved = true;
              }
            });
        } else if (route.params.privateKey) {
          await wallets
            .addWalletFromPrivateKey(route.params.privateKey, name)
            .then(wallet => {
              if (wallet) {
                wallet.mnemonicSaved = true;
              }
            });
        }

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
              captureException(error, 'restoreStore');
              navigation.getParent()?.goBack();
            }
        }
      }
    }, 350);
  }, [navigation, route, wallets]);

  return <View />;
};
