import React, {useMemo} from 'react';
import {Button, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useWallet} from '../contexts/wallet';

type Create2ScreenProp = CompositeScreenProps<any, any>;

export const Create2Screen = ({navigation}: Create2ScreenProp) => {
  const wallet = useWallet();

  const mnemonic = useMemo(() => wallet.generateMnemonic(), [wallet]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Create 2 Screen</Text>
      <Text>{mnemonic.split(' ')}</Text>
      <Button
        title="Go next"
        onPress={() => navigation.navigate('create-3', {mnemonic})}
      />
    </View>
  );
};
