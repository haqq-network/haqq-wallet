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
  Spacer,
  Text,
} from './ui';
import {
  LIGHT_BG_1,
  LIGHT_BG_5,
  LIGHT_GRAPHIC_BASE_3,
  SHADOW_COLOR,
  SYSTEM_BLUR_2,
  LIGHT_TEXT_BASE_3,
  LIGHT_TEXT_SECOND_2,
  TRANSPARENT,
} from '../variables';
import {RootStackParamList} from '../types';
import {cleanNumber, shortAddress} from '../utils';
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
    console.log('onPressSend', address);
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
        <Text t12 style={page.name} ellipsizeMode="tail" numberOfLines={1}>
          {wallet.name || 'name'}
        </Text>
        <IconButton onPress={onPressQR} style={page.qrButton}>
          <QRCode color={LIGHT_GRAPHIC_BASE_3} />
        </IconButton>
        <CopyButton style={page.copyButton} value={wallet.address}>
          <Text t14 style={page.address}>
            {formattedAddress}
          </Text>
          <Copy color={LIGHT_GRAPHIC_BASE_3} style={page.marginLeft} />
        </CopyButton>
      </View>
      {!wallet.mnemonicSaved && (
        <IconButton onPress={onClickBackup} style={page.cacheButton}>
          <Text clean style={page.cacheText}>
            Without backup
          </Text>
        </IconButton>
      )}
      <Text t0 style={page.balance} numberOfLines={1} adjustsFontSizeToFit>
        {cleanNumber(balance.toFixed(2))} ISLM
      </Text>
      <Spacer />
      <View style={page.buttonsContainer}>
        <View style={page.button}>
          {isIOS && <BlurView action="sent" cardState={cardState} />}
          <IconButton style={page.spacer} onPress={onPressSend}>
            <ArrowSend color={LIGHT_GRAPHIC_BASE_3} />
            <Text clean style={page.buttonText}>
              Send
            </Text>
          </IconButton>
        </View>
        <View style={page.button}>
          {isIOS && <BlurView action="receive" cardState={cardState} />}
          <IconButton style={page.spacer} onPress={onPressQR}>
            <ArrowReceive color={LIGHT_GRAPHIC_BASE_3} />
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
    backgroundColor: LIGHT_BG_1,
    shadowColor: SHADOW_COLOR,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 13,
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
    flex: 1,
    color: LIGHT_TEXT_SECOND_2,
    marginRight: 8,
  },
  address: {
    color: LIGHT_TEXT_BASE_3,
  },
  balance: {
    fontSize: 40,
    lineHeight: 54,
    color: LIGHT_TEXT_BASE_3,
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
    backgroundColor: isIOS ? TRANSPARENT : SYSTEM_BLUR_2,
    borderRadius: 16,
    padding: 6,
    overflow: 'hidden',
  },
  buttonText: {
    color: LIGHT_TEXT_BASE_3,
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
    backgroundColor: LIGHT_BG_5,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cacheText: {
    fontSize: 12,
    lineHeight: 16,
    color: LIGHT_TEXT_BASE_3,
  },
});
