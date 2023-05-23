import React, {useCallback, useEffect, useState} from 'react';

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

export const LedgerNoApp = ({onRetry, onClose}: Modals['ledgerNoApp']) => {
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  const onRetryPress = useCallback(async () => {
    setRetry(true);
    await onRetry();
    setRetry(false);
  }, [onRetry]);

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={page.modalView}>
          <Text t5 center i18n={I18N.ledgerNoAppTitle} />
          <Spacer height={8} />
          <Text t14 center i18n={I18N.ledgerNoAppDescription} />
          <Spacer centered minHeight={204}>
            <Image source={require('@assets/images/ledger-no-app.png')} />
          </Spacer>
          <Button
            loading={retry}
            i18n={I18N.ledgerNoAppRetry}
            onPress={onRetryPress}
            variant={ButtonVariant.second}
            size={ButtonSize.middle}
          />
          <Spacer height={16} />
          <Button
            i18n={I18N.ledgerNoAppClose}
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
