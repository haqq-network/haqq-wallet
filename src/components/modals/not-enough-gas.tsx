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
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Modals} from '@app/types';

export const NotEnoughGas = ({
  onClose,
  currentAmount,
  gasLimit,
}: Modals['notEnoughGas']) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={page.modalView}>
          <Text t5 center i18n={I18N.notEnoughGasTitle} />
          <Spacer height={8} />
          <Text t11 center>
            {getText(I18N.notEnoughGasDescription1)}
            <Text
              t12
              i18n={I18N.notEnoughGasDescription2}
              i18params={{
                gasLimit: gasLimit?.toWeiString(),
              }}
            />
            {getText(I18N.notEnoughGasDescription3)}
            <Text
              t12
              i18n={I18N.notEnoughGasDescription4}
              i18params={{
                currentAmount: currentAmount?.toWeiString(),
              }}
            />
            {getText(I18N.notEnoughGasDescription5)}
          </Text>
          <Spacer height={32} />
          <Image
            source={require('@assets/images/not-enough-gas.png')}
            style={page.image}
          />
          <Spacer height={32} />
          <Button
            i18n={I18N.bluetoothUnauthorizedClose}
            onPress={() => onCloseModal(onClose)}
            variant={ButtonVariant.text}
            style={page.button}
            size={ButtonSize.middle}
          />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const page = createTheme({
  modalView: {
    alignItems: 'center',
    backgroundColor: Color.bg1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
  button: {
    width: '100%',
  },
  image: {
    width: 136,
    height: 136,
    tintColor: Color.graphicSecond2,
  },
});
