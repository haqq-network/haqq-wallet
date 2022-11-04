import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {BarCodeReadEvent} from 'react-native-camera';
// @ts-ignore
import {QRreader, QRscanner} from 'react-native-qr-decode-image-camera';
import {launchImageLibrary} from 'react-native-image-picker';
import {utils} from 'ethers';
import {
  ArrowBackIcon,
  FlashLightIcon,
  IconButton,
  ImageIcon,
  Spacer,
  Text,
} from '../ui';
import {
  GRAPHIC_BASE_3,
  GRAPHIC_RED_1,
  GRAPHIC_SECOND_12,
  GRAPHIC_SECOND_8,
  GRAPHIC_SECOND_9,
  TEXT_BASE_3,
} from '../../variables';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HapticEffects, vibrate} from '../../services/haptic';
import {BottomSheet} from '../bottom-sheet';
import {useWallets} from '../../contexts/wallets';
import {WalletRow} from '../wallet-row';
import {navigator} from '../../app';
import {hideModal} from '../../helpers/modal';

export type QRModalProps = {
  onClose: () => void;
};

export const QRModal = ({onClose}: QRModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wallets = useWallets();

  const closeDistance = useWindowDimensions().height / 6;
  const [rows, setRows] = useState(wallets.getWallets());
  const [code, setCode] = useState('');

  const prepareAddress = useCallback((data: string) => {
    if (data.startsWith('haqq:')) {
      return data.slice(5);
    }

    if (data.startsWith('etherium:')) {
      return data.slice(9);
    }
    if (data.trim() !== '') {
      return data.trim();
    }
  }, []);

  const onPressRow = (address: string) => {
    hideModal();
    navigator.navigate('transaction', {
      to: prepareAddress(code),
      from: address.trim(),
    });
  };

  useEffect(() => {
    setRows(wallets.getWallets());

    const callback = () => {
      setRows(wallets.getWallets());
    };

    wallets.on('wallets', callback);
    return () => {
      wallets.off('wallets', callback);
    };
  }, [wallets]);

  const [error, setError] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const insets = useSafeAreaInsets();
  const onSuccess = useCallback(
    (e: BarCodeReadEvent) => {
      if (e.data && e.data !== code) {
        vibrate(HapticEffects.selection);
        setCode(e.data);
      }
    },
    [code],
  );

  const checkAddress = useCallback(
    (address: string) => {
      if (utils.isAddress(address)) {
        if (rows.length === 1) {
          hideModal();
          navigator.navigate('transaction', {
            to: prepareAddress(address),
            from: rows[0].address.trim(),
          });
        } else {
          setIsOpen(true);
        }
      } else {
        setError(true);
        vibrate(HapticEffects.error);
        setTimeout(() => {
          setError(false);
        }, 5000);
      }
    },
    [rows, prepareAddress, setIsOpen],
  );

  const onClickGallery = useCallback(async () => {
    const response = await launchImageLibrary({mediaType: 'photo'});
    if (response.assets && response.assets.length) {
      const first = response.assets[0];

      if (first.uri) {
        try {
          const data = await QRreader(first.uri);
          setCode(data);
          const slicedAddress = prepareAddress(data);
          if (slicedAddress) {
            checkAddress(slicedAddress);
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  }, [prepareAddress, checkAddress]);

  const onCloseBottomSheet = () => setIsOpen(false);

  return (
    <>
      <StatusBar backgroundColor={GRAPHIC_SECOND_12} />
      <QRscanner
        isRepeatScan={true}
        vibrate={false}
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
              <Text t8 style={page.headerTitle}>
                Scan QR Code
              </Text>
              <View style={page.headerSpacer} />
            </View>
          </View>
        )}
        renderBottomView={() => (
          <View
            style={[page.bottomContainer, {paddingBottom: insets.bottom + 50}]}>
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
      {error && (
        <View style={page.bottomErrorContainer}>
          <View style={page.bottomError}>
            <Text t8 style={page.bottomErrorText}>
              Invalid code
            </Text>
          </View>
        </View>
      )}
      {isOpen && (
        <BottomSheet
          onClose={onCloseBottomSheet}
          closeDistance={closeDistance}
          title="Send funds from">
          {rows.map((item, id) => (
            <WalletRow key={id} item={item} onPress={onPressRow} />
          ))}
          <Spacer style={page.spacer} />
        </BottomSheet>
      )}
    </>
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
    backgroundColor: GRAPHIC_SECOND_8,
  },
  bottomError: {
    backgroundColor: GRAPHIC_RED_1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  bottomErrorContainer: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Dimensions.get('window').height / 2 - 135,
  },
  bottomErrorText: {color: TEXT_BASE_3, fontWeight: '600'},
  iconButton: {
    marginHorizontal: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GRAPHIC_SECOND_9,
  },
  spacer: {height: 50},
});
