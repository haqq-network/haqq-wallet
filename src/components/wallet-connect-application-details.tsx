import React, {useMemo} from 'react';

import {format} from 'date-fns';
import {Image, ScrollView, View} from 'react-native';
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
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletConnectSessionMetadata} from '@app/models/wallet-connect-session-metadata';
import {WalletConnectSessionType} from '@app/types/wallet-connect';
import {getHostnameFromUrl} from '@app/utils';

interface WalletConnectApplicationDetailsProps {
  linkedWallet: Wallet;
  session: WalletConnectSessionType;
  sessionMetadata: WalletConnectSessionMetadata;

  handleDisconnectPress(): void;
}

export const WalletConnectApplicationDetails = ({
  linkedWallet,
  session,
  sessionMetadata,
  handleDisconnectPress,
}: WalletConnectApplicationDetailsProps) => {
  const insets = useSafeAreaInsets();
  const metadata = useMemo(
    () => session?.peer?.metadata,
    [session?.peer?.metadata],
  );

  const imageSource = useMemo(
    () => ({uri: metadata?.icons?.[0]}),
    [metadata?.icons],
  );
  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);

  const expiredAt = useMemo(
    () => format(session.expiry + sessionMetadata?.createdAt!, 'd MMM yyyy'),
    [session.expiry, sessionMetadata?.createdAt],
  );

  const connectedAt = useMemo(
    () => format(sessionMetadata?.createdAt!, 'd MMM yyyy'),
    [sessionMetadata?.createdAt],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}>
        <Spacer height={42} />
        <Image style={styles.imageWrapper} source={imageSource} />

        <Spacer height={16} />
        <Text t5 children={metadata?.name} />

        <Spacer height={4} />

        <Text t13 color={Color.textGreen1} children={url} />

        <Spacer height={36} />

        <WalletRow
          hideArrow
          type={WalletRowTypes.variant2}
          item={linkedWallet!}
        />

        <Spacer height={28} />

        <View style={styles.info}>
          <DataView i18n={I18N.walletConnectApprovalConnected}>
            <Text t11 color={Color.textBase1}>
              <Text children={connectedAt} />
            </Text>
          </DataView>
          <DataView i18n={I18N.walletConnectApprovalExpired}>
            <Text t11 color={Color.textBase1}>
              <Text children={expiredAt} />
            </Text>
          </DataView>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleDisconnectPress}
          i18n={I18N.walletConnectDisconnect}
          variant={ButtonVariant.text}
          textColor={Color.textRed1}
        />
        <Spacer height={insets.bottom} />
      </View>
    </View>
  );
};

const styles = createTheme({
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  info: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: Color.bg8,
  },
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
