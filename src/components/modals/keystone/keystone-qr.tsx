import React, {useEffect, useMemo, useState} from 'react';

import {UR, UREncoder} from '@ngraveio/bc-ur';
import {View, useWindowDimensions} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {createTheme} from '@app/helpers';
import {ModalType, Modals} from '@app/types';

type Props = Modals[ModalType.keystoneQR];

const MAX_FRAGMENT_LENGTH = 400;
const QR_CODE_SIZE = 250;

export const KeystoneQRModal = ({cborHex, urType}: Props) => {
  const {width} = useWindowDimensions();

  const urEncoder = useMemo(
    () =>
      new UREncoder(
        new UR(Buffer.from(cborHex, 'hex'), urType),
        MAX_FRAGMENT_LENGTH,
      ),
    [cborHex, urType],
  );

  const [currentQRCode, setCurrentQRCode] = useState(urEncoder.nextPart());

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentQRCode(urEncoder.nextPart());
    }, 250);
    return () => {
      clearInterval(id);
    };
  }, [urEncoder]);

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={styles.wrapper}>
          <QRCode
            ecl={'H'}
            logo={require('@assets/images/qr-logo.png')}
            logoSize={width / 5.86}
            logoBorderRadius={8}
            value={currentQRCode.toUpperCase()}
            size={QR_CODE_SIZE}
          />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const styles = createTheme({
  wrapper: {
    alignItems: 'center',
    backgroundColor: Color.bg1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
});
