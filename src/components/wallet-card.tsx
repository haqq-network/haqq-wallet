import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useWallets} from '../contexts/wallets';
import {Wallet} from '../models/wallet';
import {
  ArrowReceive,
  ArrowSend,
  Copy,
  CopyButton,
  IconButton,
  QRCode,
} from './ui';
import {BG_4, BG_5, GRAPHIC_BASE_3, TEXT_BASE_3} from '../variables';

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

  const onPressQR = useCallback(() => {
    navigation.navigate('detailsQr', {address: wallet.address});
  }, [navigation, wallet.address]);

  const onClickBackup = useCallback(() => {
    // navigation.navigate('backup', {address: wallet.address});
  }, [navigation, wallet.address]);

  return (
    <View style={page.container}>
      <View style={[page.topNav, !wallet.mnemonic_saved && {marginBottom: 4}]}>
        <IconButton
          onPress={() =>
            navigation.navigate('details', {address: wallet.address})
          }>
          <Text style={[page.text, {opacity: 0.8}]}>
            {wallet.name || 'name'}
          </Text>
        </IconButton>
        <View style={page.spacer} />
        <IconButton onPress={onPressQR} style={page.qrButton}>
          <QRCode color={GRAPHIC_BASE_3} />
        </IconButton>
        <CopyButton style={page.copyButton} value={wallet.address}>
          <Text style={page.text}>{formattedAddress}</Text>
          <Copy color={GRAPHIC_BASE_3} />
        </CopyButton>
      </View>
      {!wallet.mnemonic_saved && (
        <IconButton onPress={onClickBackup} style={page.cacheButton}>
          <Text style={page.cacheText}>Without backup</Text>
        </IconButton>
      )}
      <Text style={page.balance}>{balance.toFixed(4)} ISLM</Text>
      <View style={page.buttonsContainer}>
        <IconButton style={page.button} onPress={onPressSend}>
          <ArrowSend color={GRAPHIC_BASE_3} />
          <Text style={page.buttonText}>Send</Text>
        </IconButton>
        <IconButton style={page.button} onPress={onPressSend}>
          <ArrowReceive color={GRAPHIC_BASE_3} />
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
  topNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  spacer: {flex: 1},
  text: {
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_3,
  },
  balance: {
    fontFamily: 'El Messiri',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 40,
    lineHeight: 54,
    marginBottom: 16,
    color: TEXT_BASE_3,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  button: {
    marginHorizontal: 6,
    flex: 1,
    backgroundColor: BG_4,
    borderRadius: 16,
    padding: 6,
  },
  buttonText: {
    color: TEXT_BASE_3,
  },
  copyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 4,
  },
  qrButton: {},
  cacheButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    backgroundColor: BG_5,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cacheText: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_BASE_3,
  },
});
