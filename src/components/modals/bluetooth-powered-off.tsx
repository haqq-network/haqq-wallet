import React, {useEffect} from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Modals} from '@app/types';

export const BluetoothPoweredOff = ({
  onClose,
}: Modals['bluetoothPoweredOff']) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={page.modalView}>
          <Text t5 center i18n={I18N.bluetoothPoweredOffTitle} />
          <Spacer height={8} />
          <Text t14 center i18n={I18N.bluetoothPoweredOffDescription} />
          <Spacer centered minHeight={200}>
            <Image
              source={require('@assets/images/bluetooth-powered-off.png')}
            />
          </Spacer>
          <Button
            i18n={I18N.bluetoothPoweredOffClose}
            onPress={() => onCloseModal(onClose)}
            variant={ButtonVariant.third}
            size={ButtonSize.middle}
          />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const page = createTheme({
  modalView: {
    backgroundColor: Color.bg1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
});
