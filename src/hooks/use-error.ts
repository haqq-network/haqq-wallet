import Toast from 'react-native-toast-message';

import {showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {ModalType} from '@app/types';

export const useError = () => {
  return (errorId: string, errorDetails: string) => {
    Toast.show({
      type: 'error',
      text1: getText(I18N.errorText),
      text2: getText(I18N.errorCode, {id: errorId}),
      onPress: () => {
        showModal(ModalType.viewErrorDetails, {
          errorDetails,
        });
      },
    });
  };
};
