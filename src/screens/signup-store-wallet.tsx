import React, {useEffect} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View} from 'react-native';

import {useWallets} from '@app/hooks';

import {app} from '@app/contexts/app';
import {captureException} from '../helpers';
import {showModal} from '../helpers/modal';
import {generateMnemonic} from '../services/eth-utils';
import {RootStackParamList} from '../types';
import {ETH_HD_PATH, ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '../variables';

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
        const main = wallets.getMain();

        if (!main) {
          const mnemonic = await generateMnemonic();
          const wallet = await wallets.addWalletFromMnemonic(
            mnemonic,
            ETH_HD_PATH,
            wallets.getSize() === 0
              ? MAIN_ACCOUNT_NAME
              : `Account #${wallets.getSize() + 1}`,
          );
          if (wallet) {
            wallet.isMain = true;
          }
        } else {
          const password = await app.getPassword();
          const mnemonic = await main.getMnemonic(password);

          const last = wallets
            .getForRootAddress(main.rootAddress)
            .reduce((memo, wallet) => {
              const segments = wallet.path?.split('/') ?? ['0'];

              return Math.max(
                memo,
                parseInt(segments[segments.length - 1], 10),
              );
            }, 0);

          await wallets.addWalletFromMnemonic(
            mnemonic,
            `${ETH_HD_SHORT_PATH}/${last + 1}`,
            `Account #${wallets.getSize() + 1}`,
          );
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
              captureException(error, 'createStoreWallet');
              navigation.getParent()?.goBack();
            }
        }
      }
    }, 350);
  }, [navigation, route, wallets]);

  return <View />;
};
