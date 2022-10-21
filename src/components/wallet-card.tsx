import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {NavigationProp} from '@react-navigation/core/src/types';
import {Dimensions, StyleSheet, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useWallet} from '../contexts/wallets';
import {
  ArrowReceive,
  ArrowSend,
  BlurView,
  Card,
  Copy,
  CopyButton,
  IconButton,
  QRCode,
  Text,
} from './ui';
import {
  BG_5,
  GRAPHIC_BASE_3,
  GRAPHIC_SECOND_11,
  TEXT_BASE_3,
  TEXT_SECOND_2,
  TRANSPARENT,
} from '../variables';
import {RootStackParamList} from '../types';
import {shortAddress} from '../utils';
import {isIOS} from '../helpers';

export type BalanceProps = {
  address: string;
};

export const WalletCard = ({address}: BalanceProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const wallet = useWallet(address);
  const [balance, setBalance] = useState(wallet?.balance ?? 0);
  const [cardState, setCardState] = useState('loading');

  const formattedAddress = useMemo(
    () => shortAddress(wallet?.address ?? '', '•'),
    [wallet?.address],
  );

  const updateBalance = useCallback((e: {balance: number}) => {
    setBalance(e.balance);
  }, []);

  useEffect(() => {
    wallet?.on('balance', updateBalance);
    return () => {
      wallet?.off('balance', updateBalance);
    };
  }, [updateBalance, wallet]);

  const onPressSend = useCallback(() => {
    navigation.navigate('transaction', {from: address});
  }, [navigation, address]);

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
      width={Dimensions.get('window').width - 40}
      onLoad={() => {
        setCardState('laded');
      }}>
      <View style={[page.topNav, !wallet.mnemonicSaved && page.marginBottom]}>
        <Text t14 style={page.name}>
          {wallet.name || 'name'}
        </Text>
        <View style={page.spacer} />
        <IconButton onPress={onPressQR} style={page.qrButton}>
          <QRCode color={GRAPHIC_BASE_3} />
        </IconButton>
        <CopyButton style={page.copyButton} value={wallet.address}>
          <Text t14 style={page.address}>
            {formattedAddress}
          </Text>
          <Copy color={GRAPHIC_BASE_3} style={page.marginLeft} />
        </CopyButton>
      </View>
      {!wallet.mnemonicSaved && (
        <IconButton onPress={onClickBackup} style={page.cacheButton}>
          <Text clean style={page.cacheText}>
            Without backup
          </Text>
        </IconButton>
      )}
      <Text clean style={page.balance}>
        {balance.toFixed(4)} ISLM
      </Text>
      <View style={page.buttonsContainer}>
        <View style={page.button}>
          {isIOS && <BlurView action="sent" cardState={cardState} />}
          <IconButton style={page.spacer} onPress={onPressSend}>
            <ArrowSend color={GRAPHIC_BASE_3} />
            <Text clean style={page.buttonText}>
              Send
            </Text>
          </IconButton>
        </View>
        <View style={page.button}>
          {isIOS && <BlurView action="receive" cardState={cardState} />}
          <IconButton style={page.spacer} onPress={onPressQR}>
            <ArrowReceive color={GRAPHIC_BASE_3} />
            <Text clean style={page.buttonText}>
              Receive
            </Text>
          </IconButton>
        </View>
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
    backgroundColor: isIOS ? TRANSPARENT : GRAPHIC_SECOND_11,
    borderRadius: 16,
    padding: 6,
    overflow: 'hidden',
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
