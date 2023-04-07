import React, {useEffect} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {hideModal} from '@app/helpers/modal';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

export type RewardErrorProps = {};

export const RewardError = ({}: RewardErrorProps) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onClose => (
        <View style={page.modalView}>
          <Text t5 center i18n={I18N.modalRewardErrorTitle} />
          <Spacer height={8} />
          <Text t14 center i18n={I18N.modalRewardErrorDescription} />
          <Spacer height={200} centered>
            <Icon name="reward_error" color={Color.graphicSecond4} i120 />
          </Spacer>
          <Button
            i18n={I18N.modalRewardErrorClose}
            onPress={() => onClose(hideModal)}
            variant={ButtonVariant.second}
            size={ButtonSize.middle}
            style={page.button}
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
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
  button: {
    width: '100%',
  },
});
