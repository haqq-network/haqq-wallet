import React, {useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, Text, View} from 'react-native';
import {useWallet} from '../contexts/wallet';
import {utils} from 'ethers';
import {getDefaultNetwork} from '../network';

type HomeScreenProp = CompositeScreenProps<any, any>;

export const HomeScreen = ({navigation}: HomeScreenProp) => {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState('');
  const wallet = useWallet();

  useEffect(() => {
    wallet.getWallet(0).getAddress().then(setAddress);
  }, [wallet]);

  useEffect(() => {
    if (address) {
      getDefaultNetwork()
        .getBalance(address)
        .then(result => {
          setBalance(Number(utils.formatEther(result)));
        });
    }
  }, [address, setBalance]);

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
