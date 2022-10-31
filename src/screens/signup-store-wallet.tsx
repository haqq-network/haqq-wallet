import React, {useEffect} from 'react';
import {View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useWallets} from '../contexts/wallets';
import {app} from '../contexts/app';
import {utils} from 'ethers';
import {MAIN_ACCOUNT_NAME} from '../variables';
import {sleep} from '../utils';
import {modal} from '../helpers/modal';
import {captureException} from '../helpers/index';

export const SignupStoreWalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'createStoreWallet'>>();

  const wallets = useWallets();

  useEffect(() => {
    app.emit('modal', {type: 'loading', text: 'Creating a wallet'});
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const actions = [sleep(1000)];

      actions.push(
        wallets.addWalletFromMnemonic(
          utils.entropyToMnemonic(utils.randomBytes(16)),
          wallets.getSize() === 0
            ? MAIN_ACCOUNT_NAME
            : `Account #${wallets.getSize() + 1}`,
        ),
      );

      Promise.all(actions)
        .then(() => {
          navigation.navigate(route.params.nextScreen ?? 'onboardingFinish');
        })
        .catch(error => {
          switch (error) {
            case 'wallet_already_exists':
              modal('error-account-added');
              navigation.getParent()?.goBack();
              break;
            default:
              if (error instanceof Error) {
                modal('error-create-account');
                captureException(error, 'createStoreWallet');
                navigation.getParent()?.goBack();
              }
          }
        });
    }, 350);
  }, [navigation, route, wallets]);

  return <View />;
};
