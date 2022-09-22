import React, {useCallback, useEffect, useState} from 'react';
import {Dimensions, SafeAreaView, StyleSheet, View} from 'react-native';
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
  ParagraphSize,
} from '../ui';
import {GRAPHIC_BASE_3, GRAPHIC_RED_1, TEXT_BASE_3} from '../../variables';

export type QRModalProps = {
  onClose: () => void;
};

export const QRModal = ({onClose}: QRModalProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [flashMode, setFlashMode] = useState(false);

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
      style={{flex: 1}}
      onRead={onSuccess}
      flashMode={flashMode}
      hintText=""
      isShowScanBar={false}
      cornerColor={error ? GRAPHIC_RED_1 : GRAPHIC_BASE_3}
      cornerWidth={7}
      zoom={0}
      renderTopView={() => (
        <SafeAreaView>
          <View style={page.headerContainer}>
            <IconButton onPress={onClose}>
              <ArrowBackIcon color={GRAPHIC_BASE_3} />
            </IconButton>
            <Paragraph size={ParagraphSize.l} style={page.headerTitle}>
              Scan QR Code
            </Paragraph>
            <View style={page.headerSpacer} />
          </View>
        </SafeAreaView>
      )}
      renderBottomView={() => (
        <SafeAreaView style={page.bottomContainer}>
          {error && (
            <View style={page.bottomErrorContainer}>
              <Paragraph size={ParagraphSize.l} style={page.bottomErrorText}>
                Invalid code
              </Paragraph>
            </View>
          )}

          <View style={{justifyContent: 'center', flexDirection: 'row'}}>
            <IconButton
              onPress={onClickGallery}
              style={{
                marginHorizontal: 16,
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}>
              <ImageIcon color={GRAPHIC_BASE_3} />
            </IconButton>
            <IconButton
              onPress={() => {
                setFlashMode(!flashMode);
              }}
              style={{
                marginHorizontal: 16,
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}>
              <FlashLightIcon color={GRAPHIC_BASE_3} />
            </IconButton>
          </View>
        </SafeAreaView>
      )}
    />
  );
};

const page = StyleSheet.create({
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
    backgroundColor: '#0000004D',
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
});
