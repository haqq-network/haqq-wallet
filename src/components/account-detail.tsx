import React, {useCallback, useRef} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
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
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {sendNotification} from '@app/services';
import {GRADIENT_END, GRADIENT_START} from '@app/variables/common';

export interface DetailsQrModalProps {
  wallet: Wallet;
  onClose: () => void;
}

export const AccountDetail = ({wallet, onClose}: DetailsQrModalProps) => {
  const svg = useRef();
  const {width} = useWindowDimensions();

  const onCopy = useCallback(() => {
    Clipboard.setString(wallet.address);
    sendNotification(I18N.notificationCopied);
  }, [wallet]);

  const onShare = useCallback(() => {
    Share.share({message: wallet.address});
  }, [wallet]);

  return (
    <BottomSheet onClose={onClose} i18nTitle={I18N.modalDetailsQRReceive}>
      <InfoBlock
        warning
        style={page.info}
        i18n={I18N.modalDetailsQRWarning}
        icon={<Icon name="warning" color={Color.textYellow1} />}
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
            logo={require('@assets/images/qr-logo.png')}
            value={`haqq:${wallet.address}`}
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
          {wallet.address}
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

const page = createTheme({
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
});
