import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {View, useWindowDimensions} from 'react-native';

import {Color} from '@app/colors';
import {
  BlurView,
  Card,
  CopyButton,
  Icon,
  IconButton,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, showModal} from '@app/helpers';
import {useTypedNavigation, useWallet} from '@app/hooks';
import {I18N} from '@app/i18n';
import {cleanNumber, shortAddress} from '@app/utils';
import {IS_IOS, SHADOW_COLOR, SYSTEM_BLUR_2} from '@app/variables';

export type BalanceProps = {
  address: string;
};

export const WalletCard = ({address}: BalanceProps) => {
  const navigation = useTypedNavigation();
  const wallet = useWallet(address);
  const [balance, setBalance] = useState(wallet?.balance ?? 0);
  const [cardState, setCardState] = useState('loading');
  const screenWidth = useWindowDimensions().width;

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
    showModal('card-details-qr', {address});
  }, [address]);

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
      style={styles.container}
      width={screenWidth - 40}
      onLoad={() => {
        setCardState('laded');
      }}>
      <View
        style={[styles.topNav, !wallet.mnemonicSaved && styles.marginBottom]}>
        <Text t12 style={styles.name} ellipsizeMode="tail" numberOfLines={1}>
          {wallet.name || 'name'}
        </Text>
        <IconButton onPress={onPressQR} style={styles.qrButton}>
          <Icon i24 name="qr_code" color={Color.graphicBase3} />
        </IconButton>
        <CopyButton style={styles.copyButton} value={wallet.address}>
          <Text t14 color={Color.textBase3}>
            {formattedAddress}
          </Text>
          <Icon
            i24
            name="copy"
            color={Color.graphicBase3}
            style={styles.marginLeft}
          />
        </CopyButton>
      </View>
      {!wallet.mnemonicSaved && (
        <IconButton onPress={onClickBackup} style={styles.cacheButton}>
          <Text
            t15
            i18n={I18N.walletCardWithoutBackup}
            color={Color.textBase3}
          />
        </IconButton>
      )}
      <Text t0 color={Color.textBase3} numberOfLines={1} adjustsFontSizeToFit>
        {cleanNumber(balance.toFixed(2))} ISLM
      </Text>
      <Spacer />
      <View style={styles.buttonsContainer}>
        <View style={styles.button}>
          {IS_IOS && <BlurView action="sent" cardState={cardState} />}
          <IconButton style={styles.spacer} onPress={onPressSend}>
            <Icon i24 name="arrow_send" color={Color.graphicBase3} />
            <Text i18n={I18N.walletCardSend} color={Color.textBase3} />
          </IconButton>
        </View>
        <View style={styles.button}>
          {IS_IOS && <BlurView action="receive" cardState={cardState} />}
          <IconButton style={styles.spacer} onPress={onPressQR}>
            <Icon i24 name="arrow_receive" color={Color.graphicBase3} />
            <Text color={Color.textBase3} i18n={I18N.modalDetailsQRReceive} />
          </IconButton>
        </View>
      </View>
    </Card>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'space-between',
    backgroundColor: Color.bg1,
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
    color: Color.textSecond2,
    marginRight: 8,
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
    backgroundColor: IS_IOS ? Color.transparent : SYSTEM_BLUR_2,
    borderRadius: 16,
    padding: 6,
    overflow: 'hidden',
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
    backgroundColor: Color.bg5,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
