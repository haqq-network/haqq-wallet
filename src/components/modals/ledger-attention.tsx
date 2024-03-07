import React, {useEffect} from 'react';

import {View} from 'react-native';

import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  LottieWrap,
  Spacer,
  Text,
} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Color, createTheme} from '@app/theme';
import {ModalType, Modals} from '@app/types';

export const LedgerAttention = ({
  onClose,
}: Modals[ModalType.ledgerAttention]) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={page.modalView}>
          <Text t9 center i18n={I18N.ledgerAttentionTitle} />
          <Spacer centered minHeight={200}>
            <LottieWrap
              resizeMode="contain"
              style={page.animation}
              source={require('@assets/animations/transaction-ledger.json')}
              autoPlay
              loop={false}
            />
          </Spacer>
          <Button
            i18n={I18N.ledgerAttentionClose}
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
  animation: {
    width: '100%',
  },
  modalView: {
    backgroundColor: Color.bg1,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
});
