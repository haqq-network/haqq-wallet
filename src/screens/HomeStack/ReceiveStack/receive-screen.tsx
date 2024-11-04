import React, {useCallback, useMemo, useRef} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {observer} from 'mobx-react';
import {Share, View, useWindowDimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  Icon,
  InfoBlock,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {sendNotification} from '@app/services';
import {GRADIENT_END, GRADIENT_START} from '@app/variables/common';

export const ReceiveScreen = observer(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<HomeStackParamList, HomeStackRoutes.Receive>();

  const wallet = Wallet.getById(route.params.address);

  const onCloseBottomSheet = () => {
    navigation.goBack();
  };

  const svg = useRef();
  const {width} = useWindowDimensions();

  const provider = useMemo(
    () => Provider.getByEthChainId(route.params.chainId),
    [route.params.chainId],
  );

  const address = useMemo(
    () => wallet?.getAddressByProviderChainId(route.params.chainId),
    [route.params.chainId],
  );

  const onCopy = useCallback(() => {
    Clipboard.setString(address as string);
    sendNotification(I18N.notificationCopied);
  }, [address]);

  const onShare = useCallback(() => {
    Share.share({message: address as string});
  }, [address]);

  if (!wallet) {
    return null;
  }

  return (
    <BottomSheet
      onClose={onCloseBottomSheet}
      i18nTitle={I18N.modalDetailsQRReceive}>
      <InfoBlock
        warning
        style={styles.info}
        i18n={I18N.modalDetailsQRWarning}
        i18params={{
          assetName: provider!.denom,
          networkName: provider!.name,
        }}
        icon={<Icon name="warning" color={Color.textYellow1} />}
      />
      <LinearGradient
        colors={[wallet?.colorFrom, wallet?.colorTo]}
        style={styles.qrContainer}
        start={GRADIENT_START}
        end={GRADIENT_END}>
        <View style={styles.card}>
          <Card
            transparent
            width={width - 113}
            pattern={wallet?.pattern}
            colorFrom={wallet?.colorFrom}
            colorTo={wallet?.colorTo}
            colorPattern={wallet?.colorPattern}
          />
        </View>
        <View style={styles.qrStyle}>
          <QRCode
            ecl="H"
            logo={require('@assets/images/qr-logo.png')}
            value={`haqq:${address}`}
            size={width - 169}
            getRef={c => (svg.current = c)}
            logoSize={width / 5.86}
            logoBorderRadius={8}
          />
        </View>
        <Text variant={TextVariant.t14} style={styles.title}>
          {wallet?.name}
        </Text>
        <Text variant={TextVariant.t10} style={styles.address}>
          {address}
        </Text>
      </LinearGradient>

      <View style={styles.buttons}>
        <Button
          i18n={I18N.share}
          size={ButtonSize.middle}
          onPress={onShare}
          style={styles.button}
        />
        <Button
          size={ButtonSize.middle}
          style={styles.button}
          variant={ButtonVariant.second}
          i18n={I18N.copy}
          onPress={onCopy}
        />
      </View>
    </BottomSheet>
  );
});

const styles = createTheme({
  qrContainer: {
    position: 'relative',
    marginHorizontal: 36.5,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    color: Color.textSecond2,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    color: Color.textBase3,
    marginBottom: 4,
  },
  tabs: {
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  button: {
    flex: 1,
  },
  info: {marginBottom: 16},
  card: {position: 'absolute', bottom: 0, left: 0, right: 0},
  qrStyle: {
    padding: 12,
    backgroundColor: Color.graphicBase3,
    borderRadius: 12,
    marginBottom: 20,
  },
  tabsContentContainerStyle: {
    flex: 1,
  },
  tabHeaderStyle: {
    marginHorizontal: 20,
  },
});
