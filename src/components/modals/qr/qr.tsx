import React, {useCallback, useRef, useState} from 'react';

import {parseUri} from '@walletconnect/utils';
import {utils} from 'ethers';
import {Dimensions, View, useWindowDimensions} from 'react-native';
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

import {QrBottomView} from './qr-bottom-view';
import {QrNoAccess} from './qr-no-access';
import {QrTopView} from './qr-top-view';

export type QRModalProps = Modals['qr'];

export const QRModal = ({onClose = () => {}, qrWithoutFrom}: QRModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const visible = useWalletsVisible();
  const [error, setError] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const closeDistance = useWindowDimensions().height / 6;
  const [code, setCode] = useState('');
  const isProcessing = useRef(false);

  const vibrateWrapper = useCallback(
    (effect: HapticEffects) => {
      if (!error) {
        vibrate(effect);
      }
    },
    [error],
  );

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
          vibrateWrapper(HapticEffects.success);
          setIsOpen(true);
        }
      } else if (parseUri(address)?.protocol === 'wc') {
        onClose();
        setTimeout(() => {
          app.emit(Events.onWalletConnectUri, address);
        }, 1000);
      } else if (!error) {
        setError(true);
        vibrateWrapper(HapticEffects.error);
        setTimeout(() => {
          setError(false);
        }, 5000);
      }
    },
    [error, visible, onClose, prepareAddress, vibrateWrapper],
  );

  const onGetAddress = useCallback(
    (slicedAddress: string) => {
      if (slicedAddress && qrWithoutFrom) {
        vibrateWrapper(HapticEffects.success);
        app.emit('address', {
          to: slicedAddress,
        });
      } else if (slicedAddress) {
        checkAddress(slicedAddress);
      }
    },
    [checkAddress, qrWithoutFrom, vibrateWrapper],
  );

  const onSuccess = useCallback(
    (e: BarCodeReadEvent) => {
      if (!isProcessing.current && e.data && e.data !== code) {
        isProcessing.current = true;
        try {
          vibrateWrapper(HapticEffects.selection);
          setCode(e.data);
          const slicedAddress = prepareAddress(e.data);
          if (slicedAddress) {
            onGetAddress(slicedAddress);
          }
        } finally {
          isProcessing.current = false;
        }
      }
    },
    [code, onGetAddress, prepareAddress, vibrateWrapper],
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
    vibrateWrapper(HapticEffects.impactLight);
  }, [vibrateWrapper]);

  return (
    <>
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
            <Text t8 color={Color.textBase3} i18n={I18N.qrModalInvalidCode} />
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
