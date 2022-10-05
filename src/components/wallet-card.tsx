import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {NavigationProp} from '@react-navigation/core/src/types';
import {Dimensions, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useWallet} from '../contexts/wallets';
import {
  ArrowReceive,
  ArrowSend,
  Card,
  Copy,
  CopyButton,
  IconButton,
  Paragraph,
  QRCode,
} from './ui';
import {
  BG_10,
  BG_5,
  GRAPHIC_BASE_3,
  TEXT_BASE_3,
  TEXT_SECOND_2,
} from '../variables';
import {RootStackParamList} from '../types';
import {shortAddress} from '../utils';

export type BalanceProps = {
  address: string;
};

export const WalletCard = ({address}: BalanceProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const wallet = useWallet(address);
  const [balance, setBalance] = useState(wallet?.balance ?? 0);

  const formattedAddress = useMemo(
    () => shortAddress(wallet?.address ?? '', '•'),
    [wallet?.address],
  );

  const updateBalance = useCallback(({balance}: {balance: number}) => {
    setBalance(balance);
  }, []);

  useEffect(() => {
    wallet?.on('balance', updateBalance);
    return () => {
      wallet?.off('balance', updateBalance);
    };
  }, [updateBalance, wallet]);

  const onPressSend = useCallback(() => {
    navigation.navigate('transaction', {from: address});
  }, [wallet, navigation]);

  const onPressQR = useCallback(() => {
    navigation.navigate('detailsQr', {address: address});
  }, [navigation, address]);

  const onClickBackup = useCallback(() => {
    navigation.navigate('backup', {address: address});
  }, [navigation, address]);

  if (!wallet) {
    return null;
  }

  return (
    <Card
      colorFrom={wallet?.colorFrom}
      colorTo={wallet?.colorTo}
      colorPattern={wallet?.colorPattern}
      pattern={wallet?.pattern}
      style={page.container}
      width={Dimensions.get('window').width - 40}>
      <View style={[page.topNav, !wallet.mnemonicSaved && page.marginBottom]}>
        <Paragraph h3 style={page.name}>
          {wallet.name || 'name'}
        </Paragraph>
        <View style={page.spacer} />
        <IconButton onPress={onPressQR} style={page.qrButton}>
          <QRCode color={GRAPHIC_BASE_3} />
        </IconButton>
        <CopyButton style={page.copyButton} value={wallet.address}>
          <Paragraph h3 style={page.address}>
            {formattedAddress}
          </Paragraph>
          <Copy color={GRAPHIC_BASE_3} style={page.marginLeft} />
        </CopyButton>
      </View>
      {!wallet.mnemonicSaved && (
        <IconButton onPress={onClickBackup} style={page.cacheButton}>
          <Paragraph clean style={page.cacheText}>
            Without backup
          </Paragraph>
        </IconButton>
      )}
      <Paragraph clean style={page.balance}>
        {balance.toFixed(4)} ISLM
      </Paragraph>
      <View style={page.buttonsContainer}>
        <IconButton style={page.button} onPress={onPressSend}>
          <ArrowSend color={GRAPHIC_BASE_3} />
          <Paragraph clean style={page.buttonText}>
            Send
          </Paragraph>
        </IconButton>
        <IconButton style={page.button} onPress={onPressQR}>
          <ArrowReceive color={GRAPHIC_BASE_3} />
          <Paragraph clean style={page.buttonText}>
            Receive
          </Paragraph>
        </IconButton>
      </View>
    </Card>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  spacer: {flex: 1},
  marginLeft: {marginLeft: 4},
  marginBottom: {marginBottom: 4},
  name: {
    fontWeight: '700',
    color: TEXT_SECOND_2,
  },
  address: {
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
    height: 54,
    marginHorizontal: 6,
    flex: 1,
    backgroundColor: BG_10,
    borderRadius: 16,
    padding: 6,
  },
  buttonText: {
    color: TEXT_BASE_3,
  },
  copyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 12,
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
