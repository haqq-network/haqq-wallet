import React, {useRef} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Share, StyleSheet, View, useWindowDimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

import {useApp, useWallet} from '@app/hooks';

import {BottomSheet} from '../components/bottom-sheet';
import {
  Alert,
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  InfoBlock,
  InfoBlockType,
  Text,
} from '../components/ui';
import {Wallet} from '../models/wallet';
import {RootStackParamList} from '../types';
import {
  GRADIENT_END,
  GRADIENT_START,
  LIGHT_GRAPHIC_BASE_3,
  LIGHT_TEXT_BASE_3,
  LIGHT_TEXT_SECOND_2,
  LIGHT_TEXT_YELLOW_1,
} from '../variables';

export const DetailsQrScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'detailsQr'>>();
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
        icon={<Alert color={LIGHT_TEXT_YELLOW_1} />}>
        Only ISLM related assets on HAQQ network are supported.
      </InfoBlock>
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
            logo={require('../../assets/images/qr-logo.png')}
            value={`haqq:${address}`}
            size={width - 169}
            getRef={c => (svg.current = c)}
            logoSize={width / 5.86}
            logoBorderRadius={8}
          />
        </View>
        <Text t14 style={page.title}>
          {wallet?.name}
        </Text>
        <Text t10 style={page.address}>
          {address}
        </Text>
      </LinearGradient>

      <View style={page.buttons}>
        <Button
          title="Share"
          size={ButtonSize.middle}
          onPress={onShare}
          style={page.button}
        />
        <Button
          size={ButtonSize.middle}
          style={page.button}
          variant={ButtonVariant.second}
          title="Copy"
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
    color: LIGHT_TEXT_SECOND_2,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    color: LIGHT_TEXT_BASE_3,
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
    backgroundColor: LIGHT_GRAPHIC_BASE_3,
    borderRadius: 12,
    marginBottom: 20,
  },
});
