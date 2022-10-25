import React, {useEffect} from 'react';
import {View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useWallets} from '../contexts/wallets';
import {useApp} from '../contexts/app';
import {utils} from 'ethers';
import {MAIN_ACCOUNT_NAME} from '../variables';
import {sleep} from '../utils';
import {Wallet} from '../models/wallet';
import {useTransactions} from '../contexts/transactions';

export const SignupStoreWalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'createStoreWallet'>>();
  const transactions = useTransactions();

  const app = useApp();
  const wallets = useWallets();

  useEffect(() => {
    app.emit('modal', {type: 'loading', text: 'Creating a wallet'});
  }, [app]);

  useEffect(() => {
    setTimeout(() => {
      const actions = [sleep(4000)];

      actions.push(
        wallets.addWalletFromMnemonic(
          utils.entropyToMnemonic(utils.randomBytes(16)),
          wallets.getSize() === 0
            ? MAIN_ACCOUNT_NAME
            : `Account #${wallets.getSize() + 1}`,
        ),
      );

      Promise.all(actions)
        .then(resp => {
          navigation.navigate(route.params.nextScreen ?? 'onboardingFinish');
          return resp[1] as Wallet;
        })
        .then(async wallet => {
          if (wallet) {
            await wallet.checkBalance();
            return transactions.loadTransactionsFromExplorer(
              wallet.address,
              app.getUser().providerId,
            );
          }
        });
    }, 350);
  }, [app, navigation, route, transactions, wallets]);

  return <View />;
};
