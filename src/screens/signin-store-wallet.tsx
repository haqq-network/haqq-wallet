import React, {useEffect} from 'react';
import {View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {useApp} from '../contexts/app';
import {MAIN_ACCOUNT_NAME} from '../variables';
import {sleep} from '../utils';
import {useTransactions} from '../contexts/transactions';
import {Wallet} from '../models/wallet';

type SigninStoreWalletScreenProp = CompositeScreenProps<any, any>;

export const SigninStoreWalletScreen = ({
  navigation,
  route,
}: SigninStoreWalletScreenProp) => {
  const app = useApp();
  const wallets = useWallets();
  const transactions = useTransactions();

  useEffect(() => {
    app.emit('modal', {type: 'loading', text: 'Wallet recovery in progress'});
  }, [app]);

  useEffect(() => {
    requestAnimationFrame(() => {
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
    });
  }, [navigation, route, wallets]);

  return <View />;
};
