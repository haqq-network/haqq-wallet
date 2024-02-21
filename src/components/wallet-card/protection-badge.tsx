import React, {useMemo} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Icon,
  IconButton,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

enum ProtectionStatus {
  empty,
  partially,
  full,
  hidden,
}

type ProtectionBadgeProps = {
  wallet: Wallet;
  isSecondMnemonic: boolean;
  onPressProtection: (wallet: Wallet) => void;
  onPressWalletConnect?: (address: string) => void;
  walletConnectSessions: SessionTypes.Struct[];
};

export const ProtectionBadge = ({
  wallet,
  isSecondMnemonic,
  onPressProtection,
  onPressWalletConnect,
  walletConnectSessions,
}: ProtectionBadgeProps) => {
  const isImported = wallet.isImported || isSecondMnemonic;

  const protectionStatus = useMemo(() => {
    // Wallet is 2nd mnemonic (imported) or user have imported this wallet after SSS
    // or Ledger / Hot
    if (
      isImported ||
      [WalletType.ledgerBt, WalletType.hot].includes(wallet.type)
    ) {
      return ProtectionStatus.hidden;
    }

    // Other types
    if (!wallet.mnemonicSaved && !wallet.socialLinkEnabled) {
      return ProtectionStatus.empty;
    }
    if (!wallet.mnemonicSaved || !wallet.socialLinkEnabled) {
      return ProtectionStatus.partially;
    }
    return ProtectionStatus.full;
  }, [wallet.mnemonicSaved, wallet.socialLinkEnabled, isImported]);

  const onProtection = () => {
    if (wallet.accountId) {
      onPressProtection(wallet);
    }
  };

  const onWalletConnect = () => {
    onPressWalletConnect?.(wallet?.address);
  };

  return (
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
              variant={TextVariant.t15}
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
              variant={TextVariant.t15}
              i18n={I18N.walletCardPartiallyProtection}
              color={Color.textYellow1}
            />
          </IconButton>
          <Spacer width={8} />
        </>
      )}
      {!!walletConnectSessions?.length && (
        <IconButton onPress={onWalletConnect} style={styles.walletConnectApps}>
          <Icon i16 name={IconsName.link} color={Color.graphicBase3} />
          <Spacer width={4} />
          <Text
            variant={TextVariant.t15}
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
              variant={TextVariant.t15}
              i18n={I18N.walletCardFullProtection}
              color={Color.textSecond2}
            />
          </IconButton>
          <Spacer width={8} />
        </>
      )}
      {([WalletType.hot, WalletType.ledgerBt].includes(wallet.type) ||
        isImported) && (
        <>
          <IconButton style={styles.fullProtection}>
            <Icon name={IconsName.import} color={Color.textSecond2} i16 />
            <Spacer width={4} />
            <Text
              variant={TextVariant.t15}
              i18n={I18N.walletCardImported}
              color={Color.textSecond2}
            />
          </IconButton>
          <Spacer width={8} />
        </>
      )}
    </View>
  );
};

const styles = createTheme({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
