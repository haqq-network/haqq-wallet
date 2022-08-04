import React, {useCallback, useEffect, useState} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {getDefaultNetwork} from '../network';
import ethers, {utils} from 'ethers';
import {useNavigation} from '@react-navigation/native';

export type BalanceProps = {
  wallet: ethers.Wallet;
};
export const Balance = ({wallet}: BalanceProps) => {
  const navigation = useNavigation();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (wallet.address) {
      getDefaultNetwork()
        .getBalance(wallet.address)
        .then(result => {
          setBalance(Number(utils.formatEther(result)));
        });
    }
  }, [wallet, setBalance]);

  const onPressBalance = useCallback(() => {
    navigation.navigate('details', {
      address: wallet.address,
    });
  }, [wallet, navigation]);

  return (
    <TouchableOpacity
      style={{alignItems: 'center', marginTop: 10, marginBottom: 10}}
      onPress={onPressBalance}>
      <Text>{wallet.address}</Text>
      <Text>{balance.toFixed(8)} ISLM</Text>
    </TouchableOpacity>
  );
};
