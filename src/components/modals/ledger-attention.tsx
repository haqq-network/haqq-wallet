import React, {useEffect} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  LottieWrap,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {hideModal} from '@app/helpers/modal';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const LedgerAttention = () => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onClose => (
        <View style={page.modalView}>
          <Text t9 center i18n={I18N.ledgerAttentionTitle} />
          <Spacer centered minHeight={200}>
            <LottieWrap
              resizeMode="contain"
              style={page.animation}
              source={require('../../../assets/animations/transaction-ledger.json')}
              autoPlay
              loop={false}
            />
          </Spacer>
          <Button
            i18n={I18N.ledgerAttentionClose}
            onPress={() => onClose(hideModal)}
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
