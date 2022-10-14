import React, {useEffect} from 'react';
import {View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NextScreenT, RootStackParamList} from '../types';
import {useWallets} from '../contexts/wallets';
import {useApp} from '../contexts/app';
import {MAIN_ACCOUNT_NAME} from '../variables';
import {sleep} from '../utils';
import {useTransactions} from '../contexts/transactions';
import {Wallet} from '../models/wallet';

type ParamList = {
  restoreStore: {
    mnemonic: string;
    privateKey: string | false;
    nextScreen: NextScreenT;
  };
};

export const SigninStoreWalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<ParamList, 'restoreStore'>>();
  const app = useApp();
  const wallets = useWallets();
  const transactions = useTransactions();

  useEffect(() => {
    app.emit('modal', {type: 'loading', text: 'Wallet recovery in progress'});
  }, [app]);

  useEffect(() => {
    setTimeout(() => {
      const actions = [sleep(4000)];
      const name =
        wallets.getSize() === 0
          ? MAIN_ACCOUNT_NAME
          : `Account #${wallets.getSize() + 1}`;

      if (route.params.mnemonic) {
        actions.push(
          wallets.addWalletFromMnemonic(route.params.mnemonic, name),
        );
      } else if (route.params.privateKey) {
        actions.push(
          wallets.addWalletFromPrivateKey(route.params.privateKey, name),
        );
      }

      Promise.all(actions)
        .then(resp => {
          navigation.navigate(route.params.nextScreen ?? 'onboardingFinish');
          return resp[1] as Wallet;
        })
        .then(wallet => {
          if (wallet) {
            wallet.mnemonicSaved = true;
            return transactions.loadTransactionsFromExplorer(wallet.address);
          }
        });
    }, 350);
  }, [navigation, route, transactions, wallets]);

  return <View />;
};
