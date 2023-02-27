import React, {useCallback, useEffect, useMemo} from 'react';

import {format} from 'date-fns';
import {Image, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  Spacer,
  Text,
} from '@app/components/ui';
import {WalletRow, WalletRowTypes} from '@app/components/wallet-row';
import {createTheme} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {getWalletConnectAccountsFromSession} from '@app/utils';

export const WalletConnectApplicationDetails = () => {
  const navivation = useTypedNavigation();
  const {params} = useTypedRoute<'walletConnectApplicationDetails'>();
  const insets = useSafeAreaInsets();
  const session = useMemo(() => params?.session, [params?.session]);
  const metadata = useMemo(
    () => session?.peer?.metadata,
    [session?.peer?.metadata],
  );

  const imageSource = useMemo(
    () => ({uri: metadata?.icons?.[0]}),
    [metadata?.icons],
  );

  const account = useMemo(
    () => getWalletConnectAccountsFromSession(session)[0],
    [session],
  );

  const linkedWallet = useMemo(
    () => Wallet.getById(account.address),
    [account.address],
  );

  useEffect(() => {
    const title = params?.isPopup
      ? getText(I18N.walletConnectTitle)
      : Wallet.getById(account.address)?.name || account.address;

    navivation.setOptions({
      title,
    });
  }, [navivation, params?.isPopup, account.address]);

  const handleDisconnectPress = useCallback(async () => {
    await WalletConnect.instance.disconnectSession(session.topic);
    navivation.goBack();
  }, [navivation, session.topic]);

  return (
    <View style={styles.container}>
      <Spacer height={42} />
      <Image style={styles.image} source={imageSource} />

      <Spacer height={16} />
      <Text t5 children={metadata?.name} />

      <Spacer height={4} />

      <Text t13 color={Color.textGreen1} children={metadata?.url} />

      <Spacer height={36} />

      <WalletRow
        hideArrow
        type={WalletRowTypes.variant2}
        item={linkedWallet!}
      />

      <Spacer height={28} />

      <View style={styles.info}>
        <DataView label="Connected">
          <Text t11 color={Color.textBase1}>
            <Text
              // TODO: refactor
              children={format(session.expiry + Date.now(), 'd MMM yyyy')}
            />
          </Text>
        </DataView>
        <DataView label="Date of expiry">
          <Text t11 color={Color.textBase1}>
            <Text
              // TODO: refactor
              children={format(session.expiry + Date.now(), 'd MMM yyyy')}
            />
          </Text>
        </DataView>
      </View>

      <Spacer flex={1} />

      <Button
        onPress={handleDisconnectPress}
        i18n={I18N.walletConnectDisconnect}
        variant={ButtonVariant.text}
        textColor={Color.textRed1}
      />

      <Spacer height={insets.bottom} />
    </View>
  );
};

const styles = createTheme({
  image: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  container: {
    flex: 1,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  info: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: Color.bg8,
  },
});
