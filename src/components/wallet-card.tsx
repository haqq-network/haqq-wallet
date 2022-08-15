import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {Wallet} from '../models/wallet';
import {ArrowReceive, ArrowSend, Copy, IconButton, QRCode} from './ui';
import Clipboard from '@react-native-clipboard/clipboard';

export type BalanceProps = {
  wallet: Wallet;
};
export const WalletCard = ({wallet}: BalanceProps) => {
  const navigation = useNavigation();
  const wallets = useWallets();
  const [balance, setBalance] = useState(0);

  const formattedAddress = useMemo(
    () =>
      `${wallet.address.slice(0, 5)}...${wallet.address.slice(
        wallet.address.length - 3,
        wallet.address.length,
      )}`,
    [wallet.address],
  );

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

  const onPressSend = useCallback(() => {
    navigation.navigate('transaction', {from: wallet.address});
  }, [wallet, navigation]);

  const onPressCopy = useCallback(() => {
    Clipboard.setString(wallet.address);
  }, [wallet.address]);

  const onPressQR = useCallback(() => {
    navigation.navigate('details-qr', {address: wallet.address});
  }, [wallet.address]);

  return (
    <View style={page.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginBottom: 30,
        }}>
        <Text style={[page.text, {opacity: 0.8}]}>{wallet.name}</Text>
        <View style={{flex: 1}} />
        <IconButton onPress={onPressQR} style={page.qrButton}>
          <QRCode style={page.qrButtonIcon} />
        </IconButton>
        <IconButton onPress={onPressCopy} style={page.copyButton}>
          <Text style={page.text}>{formattedAddress}</Text>
          <Copy style={page.buttonIcon} />
        </IconButton>
      </View>
      <Text style={page.balance}>{balance.toFixed(4)} ISLM</Text>
      <View style={page.buttonsContainer}>
        <IconButton style={page.button} onPress={onPressSend}>
          <ArrowSend style={page.buttonIcon} />
          <Text style={page.buttonText}>Send</Text>
        </IconButton>
        <IconButton style={page.button} onPress={onPressSend}>
          <ArrowReceive style={page.buttonIcon} />
          <Text style={page.buttonText}>Receive</Text>
        </IconButton>
      </View>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#03BF77',
    borderRadius: 16,
  },
  text: {
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  balance: {
    fontFamily: 'El Messiri',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 40,
    lineHeight: 54,
    marginBottom: 16,
    color: '#FFFFFF',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  button: {
    marginHorizontal: 6,
    flex: 1,
    backgroundColor: 'rgba(4, 212, 132, 0.5)',
    borderRadius: 16,
    padding: 6,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  buttonIcon: {
    color: '#FFFFFF',
  },
  copyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 4,
  },
  qrButton: {},
  qrButtonIcon: {
    color: '#FFFFFF',
  },
});
