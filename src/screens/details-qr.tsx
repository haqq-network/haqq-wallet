import React, {useRef} from 'react';
import QRCode from 'react-native-qrcode-svg';
import {CompositeScreenProps} from '@react-navigation/native';
import {Share, StyleSheet, useWindowDimensions, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';

import {BottomSheet} from '../components/bottom-sheet';
import {
  Alert,
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  InfoBlock,
  InfoBlockType,
  Paragraph,
  ParagraphSize,
} from '../components/ui';
import {
  GRADIENT_END,
  GRADIENT_START,
  GRAPHIC_BASE_3,
  TEXT_BASE_3,
  TEXT_SECOND_2,
  TEXT_YELLOW_1,
} from '../variables';
import {useWallet} from '../contexts/wallets';
import {useApp} from '../contexts/app';
import {WalletCardStyle} from '../types';
import {Wallet} from '../models/wallet';

type DetailsQrScreenProp = CompositeScreenProps<any, any>;

const logo = require('../../assets/images/qr-logo.png');

export const DetailsQrScreen = ({route, navigation}: DetailsQrScreenProp) => {
  const svg = useRef();
  const app = useApp();
  const wallet = useWallet(route.params.address) as Wallet;
  const {address} = route.params;
  const {width} = useWindowDimensions();

  const onCopy = () => {
    Clipboard.setString(address);
    app.emit('modal', {type: 'confirmation', action: 'copied'});
  };

  const onShare = () => {
    Share.share({message: address});
  };

  return (
    <BottomSheet onClose={navigation.goBack} title="Receive">
      <InfoBlock
        type={InfoBlockType.warning}
        style={{marginBottom: 16}}
        icon={<Alert color={TEXT_YELLOW_1} />}>
        Only ISLM related assets on HAQQ network are supported.
      </InfoBlock>
      <LinearGradient
        colors={[wallet?.colorFrom, wallet?.colorTo]}
        style={page.qrContainer}
        start={GRADIENT_START}
        end={GRADIENT_END}>
        <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          <Card
            transparent
            width={width - 113}
            pattern={wallet?.pattern}
            colorFrom={wallet?.colorFrom}
            colorTo={wallet?.colorTo}
            colorPattern={wallet?.colorPattern}
          />
        </View>
        <View
          style={{
            padding: 12,
            backgroundColor: GRAPHIC_BASE_3,
            borderRadius: 12,
            marginBottom: 20,
          }}>
          <QRCode
            logo={logo}
            value={`haqq:${address}`}
            size={width - 169}
            getRef={c => (svg.current = c)}
            logoSize={width / 5.86}
            logoBorderRadius={8}
          />
        </View>
        <Paragraph size={ParagraphSize.s} style={page.title}>
          {wallet?.name}
        </Paragraph>
        <Paragraph style={page.address}>{address}</Paragraph>
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
    color: TEXT_SECOND_2,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    color: TEXT_BASE_3,
    fontWeight: '600',
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
});
