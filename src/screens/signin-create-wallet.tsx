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
    wallet
      .addWalletFromMnemonic(
        utils.entropyToMnemonic(utils.randomBytes(16)),
        'Main account',
      )
      .then(() => {
        navigation.navigate('signin-finish');
      });
  }, []);

  return <View />;
};
