import React, {useMemo, useRef} from 'react';
import QRCode from 'react-native-qrcode-svg';
import {CompositeScreenProps} from '@react-navigation/native';
import {Share, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {BottomSheet} from '../components/bottom-sheet';
import {
  Alert,
  Button,
  ButtonVariant,
  InfoBlock,
  InfoBlockType,
} from '../components/ui';
import {
  GRAPHIC_BASE_3,
  TEXT_BASE_3,
  TEXT_SECOND_2,
  TEXT_YELLOW_1,
} from '../variables';
import {useWallets} from '../contexts/wallets';
import {useApp} from '../contexts/app';

type DetailsQrScreenProp = CompositeScreenProps<any, any>;

const logo = require('../../assets/images/logo.png');

export const DetailsQrScreen = ({route, navigation}: DetailsQrScreenProp) => {
  const svg = useRef();
  const app = useApp();
  const wallets = useWallets();
  const {address} = route.params;
  const {width} = useWindowDimensions();

  const walletName = useMemo(() => wallets.getWallet(address)?.name, [address]);

  const onCopy = () => {
    Clipboard.setString(address);
    app.emit('modal', {type: 'confirmation', action: 'copied'});
  };

  const onShare = () => {
    Share.share({message: address});
  };

  return (
    <BottomSheet onClose={navigation.goBack}>
      <InfoBlock
        type={InfoBlockType.warning}
        style={{marginBottom: 16}}
        icon={<Alert color={TEXT_YELLOW_1} />}>
        Only ISLM related assets on HAQQ network are supported.
      </InfoBlock>
      <View style={page.qrContainer}>
        <View
          style={{
            padding: 12,
            backgroundColor: GRAPHIC_BASE_3,
            borderRadius: 12,
            marginBottom: 20,
          }}>
          <QRCode
            logo={logo}
            value={address}
            size={width - 169}
            getRef={c => (svg.current = c)}
            logoSize={width / 5.86}
          />
        </View>
        <Text style={page.title}>{walletName}</Text>
        <Text style={page.address}>{address}</Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 50,
        }}>
        <Button title="Share" onPress={onShare} style={{flex: 1}} />
        <Button
          style={{flex: 1}}
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
    marginHorizontal: 36.5,
    padding: 16,
    backgroundColor: '#03BF77',
    borderRadius: 12,
    marginBottom: 32,
  },
  title: {
    color: TEXT_SECOND_2,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  address: {
    color: TEXT_BASE_3,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
});
