import React, {useEffect, useMemo, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, Text, View} from 'react-native';
import {useWallet} from '../contexts/wallet';
import {useGrpc} from '../contexts/grpc';
import Decimal from 'decimal.js';

type HomeScreenProp = CompositeScreenProps<any, any>;

export const HomeScreen = ({navigation}: HomeScreenProp) => {
  const [balance, setBalance] = useState(new Decimal(0));
  const wallet = useWallet();
  const grpc = useGrpc();

  const address = useMemo(() => {
    let address = wallet.getWallet(0).getAddress().toString('hex');
    return address.startsWith('0x') ? address : `0x${address}`;
  }, [wallet]);

  useEffect(() => {
    grpc.getBalance(address).then(result => {
      const newBalance = new Decimal(result.result);
      // @ts-ignore
      newBalance.e = newBalance.e - 18;
      setBalance(newBalance);
    });
  }, [address, grpc, setBalance]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      <Text>{address}</Text>
      <Text>{balance.toFixed(8)} ISLM</Text>
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
