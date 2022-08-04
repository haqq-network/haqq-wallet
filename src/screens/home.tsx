import React, {useMemo} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, Text, View} from 'react-native';
import {useWallet} from '../contexts/wallet';
import {Balance} from '../components/balance';

type HomeScreenProp = CompositeScreenProps<any, any>;

export const HomeScreen = ({navigation}: HomeScreenProp) => {
  const wallet = useWallet();
  const wallets = useMemo(() => wallet.getWallets(), [wallet]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      {wallets.map(w => (
        <Balance wallet={w} key={w.address} />
      ))}
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('details')}
      />
      <Button
        title="Logout"
        onPress={() => {
          wallet.clean().then(() => {
            navigation.navigate('login');
          });
        }}
      />
    </View>
  );
};
