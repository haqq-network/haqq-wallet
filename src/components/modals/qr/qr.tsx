import React, {useCallback, useEffect, useState} from 'react';

import {utils} from 'ethers';
import {Dimensions, StatusBar, View, useWindowDimensions} from 'react-native';
import {BarCodeReadEvent} from 'react-native-camera';
import {launchImageLibrary} from 'react-native-image-picker';
// @ts-ignore
import {QRreader, QRscanner} from 'react-native-qr-decode-image-camera';

import {Color, getColor} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {Spacer, Text} from '@app/components/ui';
import {WalletRow} from '@app/components/wallet-row';
import {createTheme, hideModal} from '@app/helpers';
import {useApp, useWallets} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {QR_STATUS_BAR} from '@app/variables';

import {QrBottomView} from './qr-bottom-view';
import {QrNoAccess} from './qr-no-access';
import {QrTopView} from './qr-top-view';

export type QRModalProps = {
  onClose?: () => void;
  qrWithoutFrom?: boolean;
};

export const QRModal = ({onClose = () => {}, qrWithoutFrom}: QRModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wallets = useWallets();
  const app = useApp();

  const closeDistance = useWindowDimensions().height / 6;
  const [rows, setRows] = useState(wallets.visible);
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

  const handleAddressEvent = useCallback(
    (address: string) => {
      app.emit('address', {
        to: prepareAddress(code),
        from: address.trim(),
      });
    },
    [app, prepareAddress, code],
  );

  useEffect(() => {
    const callback = () => {
      setRows(wallets.visible);
    };
    callback();
    wallets.on('wallets', callback);
    return () => {
      wallets.off('wallets', callback);
    };
  }, [wallets]);

  const [error, setError] = useState(false);
  const [flashMode, setFlashMode] = useState(false);

  const checkAddress = useCallback(
    (address: string) => {
      if (utils.isAddress(address)) {
        if (rows.length === 1) {
          hideModal();
          app.emit('address', {
            to: prepareAddress(address),
            from: rows[0].address.trim(),
          });
        } else {
          vibrate(HapticEffects.success);
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
    [rows, prepareAddress, app],
  );

  const onGetAddress = useCallback(
    (slicedAddress: string) => {
      if (slicedAddress && qrWithoutFrom) {
        vibrate(HapticEffects.success);
        app.emit('address', {
          to: slicedAddress,
        });
      } else if (slicedAddress) {
        checkAddress(slicedAddress);
      }
    },
    [checkAddress, app, qrWithoutFrom],
  );

  const onSuccess = useCallback(
    (e: BarCodeReadEvent) => {
      if (e.data && e.data !== code) {
        vibrate(HapticEffects.selection);
        setCode(e.data);
        const slicedAddress = prepareAddress(e.data);
        if (slicedAddress) {
          onGetAddress(slicedAddress);
        }
      }
    },
    [code, onGetAddress, prepareAddress],
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
            onGetAddress(slicedAddress);
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  }, [prepareAddress, onGetAddress]);

  const onCloseBottomSheet = () => setIsOpen(false);

  const onToggleFlashMode = useCallback(() => {
    setFlashMode(pr => !pr);
    vibrate(HapticEffects.impactLight);
  }, []);

  return (
    <>
      <StatusBar backgroundColor={QR_STATUS_BAR} />
      <QRscanner
        isRepeatScan={true}
        vibrate={false}
        style={styles.container}
        onRead={onSuccess}
        flashMode={flashMode}
        hintText=""
        isShowScanBar={false}
        cornerColor={getColor(error ? Color.graphicRed1 : Color.graphicBase3)}
        cornerWidth={7}
        zoom={0}
        notAuthorizedView={() => <QrNoAccess onClose={onClose} />}
        renderTopView={() => <QrTopView onClose={onClose} />}
        renderBottomView={() => (
          <QrBottomView
            flashMode={flashMode}
            onClickGallery={onClickGallery}
            onToggleFlashMode={onToggleFlashMode}
          />
        )}
      />
      {error && (
        <View style={styles.bottomErrorContainer}>
          <View style={styles.bottomError}>
            <Text t8 color={getColor(Color.textBase3)}>
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
            <WalletRow key={id} item={item} onPress={handleAddressEvent} />
          ))}
          <Spacer style={styles.spacer} />
        </BottomSheet>
      )}
    </>
  );
};

const styles = createTheme({
  container: {flex: 1},
  bottomError: {
    backgroundColor: Color.graphicRed1,
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
  spacer: {height: 50},
});
