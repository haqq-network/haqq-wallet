import React, {useCallback, useState} from 'react';

import {parseUri} from '@walletconnect/utils';
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
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme} from '@app/helpers';
import {useWalletsVisible} from '@app/hooks/use-wallets-visible';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Modals} from '@app/types';
import {QR_STATUS_BAR} from '@app/variables/common';

import {QrBottomView} from './qr-bottom-view';
import {QrNoAccess} from './qr-no-access';
import {QrTopView} from './qr-top-view';

export type QRModalProps = Modals['qr'];

export const QRModal = ({onClose = () => {}, qrWithoutFrom}: QRModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const visible = useWalletsVisible();

  const closeDistance = useWindowDimensions().height / 6;
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
    [prepareAddress, code],
  );

  const [error, setError] = useState(false);
  const [flashMode, setFlashMode] = useState(false);

  const checkAddress = useCallback(
    (address: string) => {
      if (utils.isAddress(address)) {
        if (visible.length === 1) {
          onClose();
          app.emit('address', {
            to: prepareAddress(address),
            from: visible[0].address.trim(),
          });
        } else {
          vibrate(HapticEffects.success);
          setIsOpen(true);
        }
      } else if (parseUri(address)?.protocol === 'wc') {
        onClose();
        setTimeout(() => {
          app.emit(Events.onWalletConnectUri, address);
        }, 1000);
      } else {
        setError(true);
        vibrate(HapticEffects.error);
        setTimeout(() => {
          setError(false);
        }, 5000);
      }
    },
    [visible, onClose, prepareAddress],
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
    [checkAddress, qrWithoutFrom],
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
            <Text t8 color={Color.textBase3}>
              Invalid code
            </Text>
          </View>
        </View>
      )}
      {isOpen && (
        <BottomSheet
          onClose={onCloseBottomSheet}
          closeDistance={closeDistance}
          i18nTitle={I18N.qrModalSendFunds}>
          {visible.map((item, id) => (
            <WalletRow key={id} item={item} onPress={handleAddressEvent} />
          ))}
          <Spacer height={50} />
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
});
