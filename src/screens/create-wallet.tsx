import React, {useMemo} from 'react';
import {Button, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';

type Create2ScreenProp = CompositeScreenProps<any, any>;

export const CreateWalletScreen = ({navigation}: Create2ScreenProp) => {
  const wallet = useWallets();

  const mnemonic = useMemo(() => wallet.generateMnemonic(), [wallet]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Create 2 Screen</Text>
      <Text>{mnemonic}</Text>
      <Button
        title="Go next"
        onPress={() => navigation.navigate('create-wallet-verify', {mnemonic})}
      />
    </View>
  );
};
