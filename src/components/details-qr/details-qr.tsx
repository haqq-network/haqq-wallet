import React, {useRef} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {Share, StyleSheet, View, useWindowDimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

import {Color, getColor} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {
  Alert,
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  InfoBlock,
  InfoBlockType,
  Text,
} from '@app/components/ui';
import {useApp, useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {GRADIENT_END, GRADIENT_START} from '@app/variables';

export const DetailsQr = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'detailsQr'>();
  const svg = useRef();
  const app = useApp();
  const wallet = useWallet(route.params.address) as Wallet;
  const {address} = route.params;
  const {width} = useWindowDimensions();

  const onCopy = () => {
    Clipboard.setString(address);
    app.emit('notification', 'Copied');
  };

  const onShare = () => {
    Share.share({message: address});
  };

  const onCloseBottomSheet = () => {
    navigation.canGoBack() && navigation.goBack();
  };

  return (
    <BottomSheet onClose={onCloseBottomSheet} title="Receive">
      <InfoBlock
        type={InfoBlockType.warning}
        style={page.info}
        i18n={I18N.detailsQrInfo}
        icon={<Alert color={getColor(Color.textYellow1)} />}
      />
      <LinearGradient
        colors={[wallet?.colorFrom, wallet?.colorTo]}
        style={page.qrContainer}
        start={GRADIENT_START}
        end={GRADIENT_END}>
        <View style={page.card}>
          <Card
            transparent
            width={width - 113}
            pattern={wallet?.pattern}
            colorFrom={wallet?.colorFrom}
            colorTo={wallet?.colorTo}
            colorPattern={wallet?.colorPattern}
          />
        </View>
        <View style={page.qrStyle}>
          <QRCode
            ecl={'H'}
            logo={require('../../../assets/images/qr-logo.png')}
            value={`haqq:${address}`}
            size={width - 169}
            getRef={c => (svg.current = c)}
            logoSize={width / 5.86}
            logoBorderRadius={8}
          />
        </View>
        <Text t14 style={page.title} color={Color.textSecond2}>
          {wallet?.name}
        </Text>
        <Text t10 style={page.address} color={Color.textBase3}>
          {address}
        </Text>
      </LinearGradient>

      <View style={page.buttons}>
        <Button
          i18n={I18N.share}
          size={ButtonSize.middle}
          onPress={onShare}
          style={page.button}
        />
        <Button
          size={ButtonSize.middle}
          style={page.button}
          variant={ButtonVariant.second}
          i18n={I18N.copy}
          onPress={onCopy}
        />
      </View>
    </BottomSheet>
  );
};

const page = StyleSheet.create({
  qrContainer: {
    position: 'relative',
    marginHorizontal: 36.5,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    marginBottom: 4,
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
    backgroundColor: getColor(Color.graphicBase3),
    borderRadius: 12,
    marginBottom: 20,
  },
});
