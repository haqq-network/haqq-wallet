import React from 'react';

import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {Button, ButtonVariant, Spacer} from '@app/components/ui';
import {WalletConnectSignInfo} from '@app/components/wallet-connect-sign-info';
import {WalletConnectTransactionInfo} from '@app/components/wallet-connect-transaction-info';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  WalletConnectSessionRequestType,
  WalletConnectSessionType,
} from '@app/types/wallet-connect';

export interface WalletConnectSignProps {
  isTransaction: boolean;
  event: WalletConnectSessionRequestType;
  session: WalletConnectSessionType;
  wallet: Wallet;

  onPressSign(): void;

  onPressReject(): void;
}

export const WalletConnectSign = ({
  isTransaction,
  event,
  session,
  onPressSign,
  onPressReject,
  wallet,
}: WalletConnectSignProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}>
        <Spacer height={32} />

        {isTransaction && (
          <WalletConnectTransactionInfo event={event} session={session!} />
        )}

        {!isTransaction && (
          <WalletConnectSignInfo
            event={event}
            session={session!}
            wallet={wallet!}
          />
        )}
      </ScrollView>

      <View style={[styles.buttonContainer, {marginBottom: insets.bottom}]}>
        <Spacer height={4} />
        <Button
          variant={ButtonVariant.contained}
          onPress={onPressSign}
          i18n={I18N.walletConnectSignApproveButton}
        />
        <Button
          textColor={Color.textRed1}
          onPress={onPressReject}
          i18n={I18N.walletConnectSignRejectButton}
        />
      </View>
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
  },
  scroll: {
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
  },
});
