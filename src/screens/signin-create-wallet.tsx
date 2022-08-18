import React, {useEffect} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {utils} from 'ethers';
import {View} from 'react-native';

type SignInCreateWalletScreenProp = CompositeScreenProps<any, any>;

export const SignInCreateWalletScreen = ({
  navigation,
}: SignInCreateWalletScreenProp) => {
  const wallet = useWallets();

  useEffect(() => {
    requestAnimationFrame(() => {
      wallet
        .addWalletFromMnemonic(
          utils.entropyToMnemonic(utils.randomBytes(16)),
          'Main account',
        )
        .then(w => {
          w.updateWallet({main: true});
          navigation.navigate('signin-finish');
        });
    });
  }, [navigation, wallet]);

  return <View />;
};
