import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {View} from 'react-native';
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

export const WalletConnectApprovalScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'walletConnectApproval'>();
  const event = useMemo(() => route?.params?.event, [route?.params?.event]);
  const wallets = useWalletsVisible();
  const [selectedWallet, setSelectedWallet] = useState<Wallet>(wallets?.[0]);
  const {bottom} = useSafeAreaInsets();
  const isApproved = useRef(false);

  const rejectSession = useCallback(
    () =>
      !isApproved.current && WalletConnect.instance.rejectSession(event?.id),
    [event?.id],
  );

  useEffect(() => {
    const onBeforeRemove = () => {
      rejectSession();
    };

    navigation.addListener('beforeRemove', onBeforeRemove);
    return () => navigation.removeListener('beforeRemove', onBeforeRemove);
  }, [navigation, rejectSession]);

  const onPressApprove = useCallback(async () => {
    await WalletConnect.instance.approveSession(
      event?.id,
      selectedWallet?.address,
      event?.params,
    );
    isApproved.current = true;
    navigation.goBack();
  }, [event?.id, event?.params, navigation, selectedWallet?.address]);

  const onPressReject = useCallback(async () => {
    await rejectSession();
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

  return (
    <View style={styles.container}>
      <View style={styles.selectAccount}>
        <Spacer height={32} />

        <Text
          t5
          i18n={I18N.walletConnectApprovalTitle}
          i18params={{name: event?.params?.proposer?.metadata?.name}}
        />

        <Spacer height={8} />

        <Text
          t13
          color={Color.textGreen1}
          children={event?.params?.proposer?.metadata?.url}
        />

        <Spacer height={36} />

        <View style={styles.islmLogosContainer}>
          <ISLMLogo border />
          <DashedLine width={26} style={styles.dashedLine} />
          <ISLMLogo border inverted />
        </View>

        <Spacer height={36} />

        <WalletRow
          hideArrow
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
});
