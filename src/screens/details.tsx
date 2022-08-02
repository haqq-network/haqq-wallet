import React from 'react';
import {Text, View} from 'react-native';
import {useWallet} from "../contexts/wallet";

export const DetailsScreen = () => {
  const wallet = useWallet();

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Details Screen</Text>
      <Text>{wallet.getMnemonicWords().join(' ')}</Text>
      <Text>{wallet.getSeed()}</Text>
    </View>
  );
};
