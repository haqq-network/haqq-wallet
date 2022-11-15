import React, {useEffect} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View} from 'react-native';

import {useWallets} from '@app/hooks';
import {captureException, showModal} from '@app/helpers';
import {EthNetwork} from '@app/services';

import {RootStackParamList} from '../types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '../variables';

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
          let canNext = true;
          let index = 0;
          while (canNext) {
            const wallet = await wallets.addWalletFromMnemonic(
              route.params.mnemonic,
              `${ETH_HD_SHORT_PATH}/${index}`,
              name,
            );

            if (wallet) {
              wallet.mnemonicSaved = true;

              const main = wallets.getMain();

              if (!main) {
                wallet.isMain = true;
              }

              const balance = await EthNetwork.getBalance(wallet.address);
              if (balance > 0 || index === 0) {
                index += 1;
              } else {
                canNext = false;
                await wallets.removeWallet(wallet.address);
              }
            }
          }
        } else if (route.params.privateKey) {
          const wallet = await wallets.addWalletFromPrivateKey(
            route.params.privateKey,
            name,
          );

          if (wallet) {
            wallet.mnemonicSaved = true;
          }
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
