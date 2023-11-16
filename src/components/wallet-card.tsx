import React, {memo, useMemo, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';

import {Color} from '@app/colors';
import {
  BlurView,
  Card,
  First,
  Icon,
  IconButton,
  IconsName,
  Spacer,
  Text,
} from '@app/components/ui';
import {CopyMenu} from '@app/components/ui/copy-menu';
import {cleanNumber, createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {useIsBalancesFirstSync} from '@app/hooks/use-is-balances-sync';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {BalanceData, WalletType} from '@app/types';
import {
  CARD_ACTION_CONTAINER_BG,
  IS_IOS,
  SHADOW_COLOR_1,
  SYSTEM_BLUR_2,
} from '@app/variables/common';

import {Placeholder} from './ui/placeholder';

export type BalanceProps = {
  testID?: string;
  wallet: Wallet;
  balance?: BalanceData;
  showLockedTokens: boolean;
  walletConnectSessions: SessionTypes.Struct[];
  onPressAccountInfo: (address: string) => void;
  onPressSend: (address: string) => void;
  onPressQR: (address: string) => void;
  onPressProtection: (wallet: Wallet) => void;
  onPressWalletConnect?: (address: string) => void;
  isSecondMnemonic: boolean;
};

enum ProtectionStatus {
  empty,
  partially,
  full,
}

export const WalletCard = memo(
  ({
    testID,
    wallet,
    walletConnectSessions,
    showLockedTokens,
    onPressSend,
    onPressQR,
    onPressWalletConnect,
    onPressProtection,
    onPressAccountInfo,
    balance,
    isSecondMnemonic,
  }: BalanceProps) => {
    const {locked, total} = balance ?? {};
    const [cardState, setCardState] = useState('loading');
    const isBalancesFirstSync = useIsBalancesFirstSync();
    const screenWidth = useWindowDimensions().width;

    const protectionStatus = useMemo(() => {
      // Wallet is 2nd mnemonic (imported)
      if (isSecondMnemonic) {
        return ProtectionStatus.full;
      }

      // Ledger and Hot always has Full Protection
      if ([WalletType.ledgerBt, WalletType.hot].includes(wallet.type)) {
        return ProtectionStatus.full;
      }

      // Other types
      if (!wallet.mnemonicSaved && !wallet.socialLinkEnabled) {
        return ProtectionStatus.empty;
      }
      if (!wallet.mnemonicSaved || !wallet.socialLinkEnabled) {
        return ProtectionStatus.partially;
      }
      return ProtectionStatus.full;
    }, [wallet.mnemonicSaved, wallet.socialLinkEnabled, isSecondMnemonic]);
    const formattedAddress = useMemo(
      () => shortAddress(wallet?.address ?? '', '•'),
      [wallet?.address],
    );
    const parsedTotal = useMemo(() => {
      if (!total) {
        return Balance.Empty.toEther();
      }

      return total.toEther();
    }, [total]);

    const onQr = () => {
      onPressQR(wallet.address);
    };

    const onProtection = () => {
      if (wallet.accountId) {
        onPressProtection(wallet);
      }
    };

    const onSend = () => {
      onPressSend(wallet.address);
    };

    const onWalletConnect = () => {
      onPressWalletConnect?.(wallet?.address);
    };

    const onAccountInfo = () => {
      onPressAccountInfo(wallet?.address);
    };

    return (
      <Card
        testID={`${testID}_card`}
        colorFrom={wallet?.colorFrom}
        colorTo={wallet?.colorTo}
        colorPattern={wallet?.colorPattern}
        pattern={wallet?.pattern}
        style={styles.container}
        width={screenWidth - 40}
        onLoad={() => {
          setCardState('laded');
        }}>
        <View style={[styles.topNav, styles.marginBottom]}>
          <Text
            t12
            style={styles.name}
            ellipsizeMode="tail"
            numberOfLines={1}
            suppressHighlighting={true}
            disabled={isBalancesFirstSync}
            onPress={onAccountInfo}>
            {wallet.name || 'name'}
          </Text>
          <CopyMenu style={styles.copyIcon} value={wallet.address} withSettings>
            <Text t14 color={Color.textBase3} testID={`${testID}_address`}>
              {formattedAddress}
            </Text>
            <Icon
              i16
              name="copy"
              color={Color.graphicBase3}
              style={styles.marginLeft}
            />
          </CopyMenu>
        </View>
        <View style={styles.row}>
          {protectionStatus === ProtectionStatus.empty && (
            <>
              <IconButton
                testID="wallet_without_protection_button"
                onPress={onProtection}
                style={styles.withoutProtection}>
                <Icon
                  name={IconsName.shield_empty}
                  color={Color.graphicBase3}
                  i16
                />
                <Spacer width={4} />
                <Text
                  t15
                  i18n={I18N.walletCardWithoutProtection}
                  color={Color.textBase3}
                />
              </IconButton>
              <Spacer width={8} />
            </>
          )}
          {protectionStatus === ProtectionStatus.partially && (
            <>
              <IconButton
                testID="wallet_without_protection_button"
                onPress={onProtection}
                style={styles.partiallyProtection}>
                <Icon
                  name={IconsName.shield_partially}
                  color={Color.textYellow1}
                  i16
                />
                <Spacer width={4} />
                <Text
                  t15
                  i18n={I18N.walletCardPartiallyProtection}
                  color={Color.textYellow1}
                />
              </IconButton>
              <Spacer width={8} />
            </>
          )}
          {!!walletConnectSessions?.length && (
            <IconButton
              onPress={onWalletConnect}
              style={styles.walletConnectApps}>
              <Icon i16 name="link" color={Color.graphicBase3} />
              <Spacer width={4} />
              <Text
                t15
                i18n={I18N.walletCardConnectedApps}
                i18params={{count: `${walletConnectSessions?.length}`}}
                color={Color.textBase3}
              />
            </IconButton>
          )}
          {protectionStatus === ProtectionStatus.full && (
            <>
              <IconButton style={styles.fullProtection}>
                <Icon name={IconsName.shield} color={Color.textSecond2} i16 />
                <Spacer width={4} />
                <Text
                  t15
                  i18n={I18N.walletCardFullProtection}
                  color={Color.textSecond2}
                />
              </IconButton>
              <Spacer width={8} />
            </>
          )}
          {([WalletType.hot].includes(wallet.type) || isSecondMnemonic) && (
            <>
              <IconButton style={styles.fullProtection}>
                <Icon name={IconsName.import} color={Color.textSecond2} i16 />
                <Spacer width={4} />
                <Text
                  t15
                  i18n={I18N.walletCardImported}
                  color={Color.textSecond2}
                />
              </IconButton>
              <Spacer width={8} />
            </>
          )}
        </View>
        <First>
          {isBalancesFirstSync && (
            <Placeholder opacity={0.6}>
              <Placeholder.Item width={110} height={35} />
            </Placeholder>
          )}
          <View style={styles.row}>
            <Text
              t0
              color={Color.textBase3}
              numberOfLines={1}
              adjustsFontSizeToFit
              i18n={I18N.amountISLM}
              i18params={{amount: cleanNumber(parsedTotal)}}
              onPress={onAccountInfo}
              suppressHighlighting={true}
            />
            <TouchableWithoutFeedback onPress={onAccountInfo}>
              <View style={styles.openDetailsIconContainer}>
                <Icon
                  i16
                  name={IconsName.arrow_forward}
                  color={Color.graphicBase3}
                  style={styles.openDetailsIcon}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </First>

        {showLockedTokens && (
          <First>
            {isBalancesFirstSync && (
              <>
                <Spacer height={8} />
                <Placeholder opacity={0.6}>
                  <Placeholder.Item width={'25%'} height={14} />
                </Placeholder>
              </>
            )}
            {locked?.isPositive() && (
              <View style={[styles.row, styles.lokedTokensContainer]}>
                <Icon i16 color={Color.textBase3} name={IconsName.lock} />
                <Spacer width={4} />
                <Text
                  t15
                  color={Color.textBase3}
                  i18n={I18N.walletCardLocked}
                  i18params={{count: locked?.toEtherString() ?? '0'}}
                  onPress={onAccountInfo}
                  suppressHighlighting={true}
                />
              </View>
            )}
          </First>
        )}
        <Spacer />
        <View style={styles.buttonsContainer}>
          <View style={styles.button}>
            {IS_IOS && <BlurView action="sent" cardState={cardState} />}
            <IconButton
              style={styles.spacer}
              onPress={onSend}
              testID={`${testID}_send`}>
              <Icon i24 name="arrow_send" color={Color.graphicBase3} />
              <Text i18n={I18N.walletCardSend} color={Color.textBase3} />
            </IconButton>
          </View>
          <View style={styles.button}>
            {IS_IOS && <BlurView action="receive" cardState={cardState} />}
            <IconButton
              style={styles.spacer}
              onPress={onQr}
              testID={`${testID}_receive`}>
              <Icon i24 name="arrow_receive" color={Color.graphicBase3} />
              <Text color={Color.textBase3} i18n={I18N.modalDetailsQRReceive} />
            </IconButton>
          </View>
        </View>
      </Card>
    );
  },
);

const styles = createTheme({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lokedTokensContainer: {
    transform: [{translateY: -4}],
  },
  openDetailsIconContainer: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: 24,
    borderRadius: 8,
    transform: [{translateY: -4}],
    backgroundColor: CARD_ACTION_CONTAINER_BG,
  },
  openDetailsIcon: {
    transform: [{translateX: -4}],
  },
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
  copyIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  withoutProtection: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 8,
    backgroundColor: Color.bg5,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    height: 20,
  },
  partiallyProtection: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 8,
    backgroundColor: Color.bg6,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    height: 20,
  },
  fullProtection: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    height: 20,
  },
  walletConnectApps: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: Color.bg9,
    height: 20,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
