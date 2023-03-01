import React, {useCallback, useMemo} from 'react';

import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {Button, ButtonVariant, Spacer} from '@app/components/ui';
import {WalletConnectSignInfo} from '@app/components/wallet-connect-sign-info';
import {WalletConnectTransactionInfo} from '@app/components/wallet-connect-transaction-info';
import {createTheme} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletConnectSession} from '@app/hooks/use-wallet-connect-session';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {getUserAddressFromSessionRequest} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

export const WalletConnectSignScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'walletConnectSign'>();
  const event = useMemo(() => route?.params?.event, [route?.params?.event]);
  const request = useMemo(() => event.params.request, [event]);
  const session = useWalletConnectSession(event?.topic);

  const isTransaction = useMemo(
    () =>
      request.method === EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION ||
      request.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    [request],
  );

  const wallet = useMemo(
    () => Wallet.getById(getUserAddressFromSessionRequest(event)),
    [event],
  );

  const onPressSign = useCallback(async () => {
    try {
      await WalletConnect.instance.approveEIP155Request(wallet!, event);
      navigation.goBack();
    } catch (err) {
      console.log('🔴 onPressApprove', err);
    }
  }, [event, navigation, wallet]);

  const onPressReject = useCallback(async () => {
    try {
      await WalletConnect.instance.rejectSessionRequest(event.id, event.topic);
      navigation.goBack();
    } catch (err) {
      console.log('🔴 onPressReject', err);
    }
  }, [event, navigation]);

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
    // flex: 1,
    alignItems: 'center',
  },
  scroll: {
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
  },
});
