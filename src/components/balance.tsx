import React, {useCallback, useEffect, useState} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import ethers from 'ethers';
import {useNavigation} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';

export type BalanceProps = {
  wallet: ethers.Wallet;
};
export const Balance = ({wallet}: BalanceProps) => {
  const navigation = useNavigation();
  const wallets = useWallets();
  const [balance, setBalance] = useState(0);

  const updateBalance = useCallback(
    async ({address}: {address: string}) => {
      if (address && address === wallet.address) {
        wallets.getBalance(address).then(result => {
          setBalance(result);
        });
      }
    },
    [wallets, wallet.address],
  );

  useEffect(() => {
    wallets.on('balance', updateBalance);
    updateBalance({address: wallet.address});
    return () => {
      wallets.off('balance', updateBalance);
    };
  }, [updateBalance, wallet.address, wallets]);

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
