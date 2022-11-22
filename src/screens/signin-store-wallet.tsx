import React, {useEffect} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View} from 'react-native';

import {captureException, showModal} from '@app/helpers';
import {useWallets} from '@app/hooks';
import {EthNetwork} from '@app/services';
import {restoreFromMnemonic} from '@app/services/eth-utils';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables';

import {RootStackParamList, WalletType} from '../types';

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
        if (route.params.mnemonic) {
          let canNext = true;
          let index = 0;
          while (canNext) {
            const name =
              wallets.getSize() === 0
                ? MAIN_ACCOUNT_NAME
                : `Account #${wallets.getSize() + 1}`;

            const node = await restoreFromMnemonic(
              String(route.params.mnemonic),
              `${ETH_HD_SHORT_PATH}/${index}`,
            );

            if (!wallets.getWallet(node.address)) {
              const balance = await EthNetwork.getBalance(node.address);
              canNext = balance > 0 || index === 0;

              if (canNext) {
                const wallet = await wallets.addWallet(
                  {
                    address: node.address,
                    type: WalletType.mnemonic,
                    privateKey: node.privateKey,
                    mnemonic: node.mnemonic,
                    path: node.path,
                    rootAddress: node.rootAddress,
                  },
                  name,
                );

                if (wallet) {
                  wallet.mnemonicSaved = true;

                  const main = wallets.getMain();

                  if (!main) {
                    wallet.isMain = true;
                  }
                }
              } else {
                canNext = false;
              }
            }

            index += 1;
          }
        } else if (route.params.privateKey) {
          const name =
            wallets.getSize() === 0
              ? MAIN_ACCOUNT_NAME
              : `Account #${wallets.getSize() + 1}`;

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
