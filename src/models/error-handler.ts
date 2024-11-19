import * as Sentry from '@sentry/react-native';
import {makeAutoObservable} from 'mobx';
import Toast from 'react-native-toast-message';

import {showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {ModalType} from '@app/types';

class ErrorHandlerStore {
  constructor() {
    makeAutoObservable(this);
  }

  notifySentry = (
    error: unknown,
    source: string,
    extras?: Record<string, any>,
  ) => {
    try {
      Sentry.captureException(error, scope => {
        scope.clear();
        scope.setTag('source', source);
        scope.setTag('tag', 'SSS_ERROR');
        if (extras) {
          scope.setExtras(extras);
        }
        return scope;
      });
    } catch (err) {
      Logger.log('notifySentry error', {
        source,
        err,
        extras,
        //@ts-ignore
        message: err?.message,
      });
    }
  };

  handle = (type: string, error: unknown) => {
    Logger.log('SSS_ERROR', type, error);
    switch (type) {
      // case 'sssLimitReached': {
      //   showModal(ModalType.sssLimitReached);
      //   break;
      // }
      default: {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: getText(I18N.errorCode, {id: type}),
          text2: getText(I18N.errorText),
          onPress: () => {
            showModal(ModalType.viewErrorDetails, {
              errorId: type,
              errorDetails: error as string,
            });
          },
        });
        Logger.captureException(error, type, {
          isSSS: true,
        });
      }
    }
  };
}

const instance = new ErrorHandlerStore();
export {instance as ErrorHandler};
