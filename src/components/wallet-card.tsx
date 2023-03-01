import React, {useMemo, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';
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
import {createTheme} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {shortAddress} from '@app/utils';
import {IS_IOS, SHADOW_COLOR_1, SYSTEM_BLUR_2} from '@app/variables/common';

export type BalanceProps = {
  wallet: Wallet;
  balance: number;
  walletConnectSessions: SessionTypes.Struct[];
  onPressSend: (address: string) => void;
  onPressQR: (address: string) => void;
  onPressBackup: (address: string) => void;
  onWalletConnectPress?: (address: string) => void;
};

export const WalletCard = ({
  wallet,
  balance,
  walletConnectSessions,
  onPressSend,
  onPressQR,
  onPressBackup,
  onWalletConnectPress,
}: BalanceProps) => {
  const [cardState, setCardState] = useState('loading');
  const screenWidth = useWindowDimensions().width;
  const disableTopNavMarginBottom =
    !wallet.mnemonicSaved || !!walletConnectSessions?.length;

  const formattedAddress = useMemo(
    () => shortAddress(wallet?.address ?? '', '•'),
    [wallet?.address],
  );

  const onQr = () => {
    onPressQR(wallet.address);
  };

  const onBackup = () => {
    if (wallet.accountId) {
      onPressBackup(wallet.accountId);
    }
  };

  const onSend = () => {
    onPressSend(wallet.address);
  };

  const onWalletConnect = () => {
    onWalletConnectPress?.(wallet?.address);
  };

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
        style={[
          styles.topNav,
          disableTopNavMarginBottom && styles.marginBottom,
        ]}>
        <Text t12 style={styles.name} ellipsizeMode="tail" numberOfLines={1}>
          {wallet.name || 'name'}
        </Text>
        <CopyButton style={styles.copyButton} value={wallet.address}>
          <Text t14 color={Color.textBase3}>
            {formattedAddress}
          </Text>
          <Icon
            i16
            name="copy"
            color={Color.graphicBase3}
            style={styles.marginLeft}
          />
        </CopyButton>
      </View>
      {!!walletConnectSessions?.length && (
        <IconButton onPress={onWalletConnect} style={styles.walletConnectApps}>
          <Icon i16 name="link" color={Color.graphicBase3} />
          <Spacer width={4} />
          <Text
            t15
            i18n={I18N.walletCardConnectedApps}
            i18params={{count: `${walletConnectSessions.length}`}}
            color={Color.textBase3}
          />
        </IconButton>
      )}
      {!wallet.mnemonicSaved && (
        <IconButton onPress={onBackup} style={styles.cacheButton}>
          <Text
            t15
            i18n={I18N.walletCardWithoutBackup}
            color={Color.textBase3}
          />
        </IconButton>
      )}
      <Text t0 color={Color.textBase3} numberOfLines={1} adjustsFontSizeToFit>
        {cleanNumber(balance)} ISLM
      </Text>
      <Spacer />
      <View style={styles.buttonsContainer}>
        <View style={styles.button}>
          {IS_IOS && <BlurView action="sent" cardState={cardState} />}
          <IconButton style={styles.spacer} onPress={onSend}>
            <Icon i24 name="arrow_send" color={Color.graphicBase3} />
            <Text i18n={I18N.walletCardSend} color={Color.textBase3} />
          </IconButton>
        </View>
        <View style={styles.button}>
          {IS_IOS && <BlurView action="receive" cardState={cardState} />}
          <IconButton style={styles.spacer} onPress={onQr}>
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
    shadowColor: SHADOW_COLOR_1,
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
    alignItems: 'center',
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
  cacheButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    backgroundColor: Color.bg5,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  walletConnectApps: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: Color.bg9,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
