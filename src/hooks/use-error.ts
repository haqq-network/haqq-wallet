import Toast from 'react-native-toast-message';

import {showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType} from '@app/types';

export const useError = () => {
  return (errorId: string, errorDetails: string) => {
    vibrate(HapticEffects.error);
    Toast.show({
      type: 'error',
      position: 'bottom',
      text1: getText(I18N.errorCode, {id: errorId}),
      text2: getText(I18N.errorText),
      onPress: () => {
        showModal(ModalType.viewErrorDetails, {
          errorId,
          errorDetails,
        });
      },
    });
  };
};
