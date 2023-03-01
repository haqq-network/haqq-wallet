import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Image, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {DashedLine} from '@app/components/dashed-line';
import {ISLMLogo} from '@app/components/islm-logo';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  InfoBlock,
  Spacer,
  Text,
} from '@app/components/ui';
import {WalletRow, WalletRowTypes} from '@app/components/wallet-row';
import {WalletSelectType, awaitForWallet, createTheme} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletsVisible} from '@app/hooks/use-wallets-visible';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {WalletType} from '@app/types';
import {getHostnameFromUrl} from '@app/utils';

export const WalletConnectApprovalScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'walletConnectApproval'>();
  const wallets = useWalletsVisible();
  const [selectedWallet, setSelectedWallet] = useState<Wallet>(wallets?.[0]);
  const {bottom} = useSafeAreaInsets();
  const isApproved = useRef(false);
  const event = useMemo(() => route?.params?.event, [route?.params?.event]);
  const metadata = useMemo(() => event?.params?.proposer?.metadata, [event]);
  const imageSource = useMemo(() => ({uri: metadata.icons?.[0]}), [metadata]);
  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);

  const rejectSession = useCallback(
    () =>
      !isApproved.current && WalletConnect.instance.rejectSession(event?.id),
    [event?.id],
  );

  const onPressApprove = useCallback(async () => {
    try {
      await WalletConnect.instance.approveSession(
        event?.id,
        selectedWallet?.address,
        event?.params,
      );
      isApproved.current = true;
    } catch (e) {
      console.error('WalletConnectApprovalScreen:onPressApprove', e);
    }
    navigation.goBack();
  }, [event?.id, event?.params, navigation, selectedWallet?.address]);

  const onPressReject = useCallback(async () => {
    try {
      await rejectSession();
    } catch (e) {
      console.error('WalletConnectApprovalScreen:onPressReject', e);
    }
    navigation.goBack();
  }, [navigation, rejectSession]);

  const onSelectWalletPress = async () => {
    const address = await awaitForWallet(
      // TODO: add ledger support
      wallets.filtered(`type != '${WalletType.ledgerBt}'`),
      I18N.selectAccount,
      WalletSelectType.screen,
      selectedWallet?.address,
    );
    setSelectedWallet(Wallet.getById(address)!);
  };

  useEffect(() => {
    const onBeforeRemove = () => {
      rejectSession();
    };

    navigation.addListener('beforeRemove', onBeforeRemove);
    return () => navigation.removeListener('beforeRemove', onBeforeRemove);
  }, [navigation, rejectSession]);

  return (
    <View style={styles.container}>
      <View style={styles.selectAccount}>
        <Spacer height={32} />

        <Text
          t5
          i18n={I18N.walletConnectApprovalTitle}
          i18params={{name: metadata?.name}}
        />

        <Spacer height={8} />

        <Text t13 color={Color.textGreen1} children={url} />

        <Spacer height={36} />

        <View style={styles.islmLogosContainer}>
          <ISLMLogo border />
          <DashedLine width={26} style={styles.dashedLine} />
          <View style={styles.eventImageContainer}>
            <Image style={styles.eventImage} source={imageSource} />
          </View>
        </View>

        <Spacer height={36} />

        <WalletRow
          type={WalletRowTypes.variant2}
          item={selectedWallet}
          onPress={onSelectWalletPress}
        />

        <Spacer height={12} />

        <InfoBlock
          warning
          icon={<Icon name="info" color={Color.textYellow1} />}>
          <Text
            t13
            color={Color.textYellow1}
            i18n={I18N.walletConnectApprovalInfoBlockTitle}
          />
          <Text i18n={I18N.walletConnectApprovalInfoBlockDescription} />
        </InfoBlock>
      </View>

      <View style={[styles.buttonContainer, {marginBottom: bottom}]}>
        <Button
          size={ButtonSize.middle}
          variant={ButtonVariant.contained}
          onPress={onPressApprove}
          title="Connect"
        />

        <Spacer height={16} />

        <Button
          size={ButtonSize.middle}
          textColor={Color.textRed1}
          onPress={onPressReject}
          title="Reject"
        />
      </View>
    </View>
  );
};

const styles = createTheme({
  selectAccount: {
    alignItems: 'center',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
  },
  container: {
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: 'space-between',
    flex: 1,
  },
  islmLogosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLine: {
    marginHorizontal: 6,
  },
  eventImage: {
    width: 44,
    height: 44,
    borderRadius: 100,
  },
  eventImageContainer: {
    width: 44 + 15,
    height: 44 + 15,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Color.graphicBase2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
