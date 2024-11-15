import * as Sentry from '@sentry/react-native';
import {makeAutoObservable} from 'mobx';

import {showModal} from '@app/helpers';
import {ModalType} from '@app/types';

type ErrorType = 'sssLimitReached';

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

  handle = (type: ErrorType, error: unknown) => {
    Logger.log('SSS_ERROR', type, error);
    switch (type) {
      case 'sssLimitReached': {
        showModal(ModalType.sssLimitReached);
        break;
      }
      default: {
        //
      }
    }
  };
}

const instance = new ErrorHandlerStore();
export {instance as ErrorHandler};
