import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {getDefaultNetwork} from '../network';
import ethers, {utils} from 'ethers';

export type BalanceProps = {
  wallet: ethers.Wallet;
};
export const Balance = ({wallet}: BalanceProps) => {
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

  return (
    <View style={{alignItems: 'center'}}>
      <Text>{wallet.address}</Text>
      <Text>{balance.toFixed(8)} ISLM</Text>
    </View>
  );
};
