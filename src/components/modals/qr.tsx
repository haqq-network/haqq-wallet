import React, {useCallback, useEffect, useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {BarCodeReadEvent} from 'react-native-camera';
// @ts-ignore
import {QRreader, QRscanner} from 'react-native-qr-decode-image-camera';
import {launchImageLibrary} from 'react-native-image-picker';
import {utils} from 'ethers';
import {app} from '../../contexts/app';
import {
  ArrowBackIcon,
  FlashLightIcon,
  IconButton,
  ImageIcon,
  Paragraph,
} from '../ui';
import {
  BG_12,
  BG_13,
  GRAPHIC_BASE_3,
  GRAPHIC_RED_1,
  TEXT_BASE_3,
} from '../../variables';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type QRModalProps = {
  onClose: () => void;
};

export const QRModal = ({onClose}: QRModalProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const insets = useSafeAreaInsets();
  const onSuccess = useCallback(
    (e: BarCodeReadEvent) => {
      console.log(e);
      if (e.data && e.data !== code) {
        setCode(e.data);
      }
    },
    [code],
  );

  const checkAddress = useCallback(address => {
    if (utils.isAddress(address)) {
      app.emit('address', address);
    } else {
      setError(true);

      setTimeout(() => {
        setError(false);
      }, 5000);
    }
  }, []);

  useEffect(() => {
    if (code.startsWith('haqq:')) {
      checkAddress(code.slice(5));
      return;
    }

    if (code.startsWith('etherium:')) {
      checkAddress(code.slice(9));
      return;
    }
  }, [checkAddress, code]);

  const onClickGallery = useCallback(async () => {
    const response = await launchImageLibrary({mediaType: 'photo'});
    if (response.assets && response.assets.length) {
      const first = response.assets[0];

      if (first.uri) {
        try {
          const data = await QRreader(first.uri);
          setCode(data);
        } catch (err) {
          console.log(err);
        }
      }
    }
  }, []);

  return (
    <QRscanner
      style={page.container}
      onRead={onSuccess}
      flashMode={flashMode}
      hintText=""
      isShowScanBar={false}
      cornerColor={error ? GRAPHIC_RED_1 : GRAPHIC_BASE_3}
      cornerWidth={7}
      zoom={0}
      renderTopView={() => (
        <View style={{paddingTop: insets.top}}>
          <View style={page.headerContainer}>
            <IconButton onPress={onClose}>
              <ArrowBackIcon color={GRAPHIC_BASE_3} />
            </IconButton>
            <Paragraph h1 style={page.headerTitle}>
              Scan QR Code
            </Paragraph>
            <View style={page.headerSpacer} />
          </View>
        </View>
      )}
      renderBottomView={() => (
        <View style={[page.bottomContainer, {paddingBottom: insets.bottom}]}>
          {error && (
            <View style={page.bottomErrorContainer}>
              <Paragraph h1 style={page.bottomErrorText}>
                Invalid code
              </Paragraph>
            </View>
          )}

          <View style={page.subContainer}>
            <IconButton onPress={onClickGallery} style={page.iconButton}>
              <ImageIcon color={GRAPHIC_BASE_3} />
            </IconButton>
            <IconButton
              onPress={() => {
                setFlashMode(!flashMode);
              }}
              style={page.iconButton}>
              <FlashLightIcon color={GRAPHIC_BASE_3} />
            </IconButton>
          </View>
        </View>
      )}
    />
  );
};

const page = StyleSheet.create({
  container: {flex: 1},
  subContainer: {justifyContent: 'center', flexDirection: 'row'},
  headerContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    height: 56,
    flexDirection: 'row',
  },
  headerTitle: {
    fontWeight: '600',
    textAlign: 'center',
    color: TEXT_BASE_3,
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  bottomContainer: {
    alignItems: 'center',
    backgroundColor: BG_12,
  },
  bottomErrorContainer: {
    position: 'absolute',
    backgroundColor: GRAPHIC_RED_1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    bottom: Dimensions.get('window').height / 4,
    borderRadius: 30,
  },
  bottomErrorText: {color: TEXT_BASE_3, fontWeight: '600'},
  iconButton: {
    marginHorizontal: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BG_13,
  },
});
