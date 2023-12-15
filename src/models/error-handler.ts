import {makeAutoObservable} from 'mobx';

import {showModal} from '@app/helpers';
import {ModalType} from '@app/types';

type ErrorType = 'sssLimitReached';

class ErrorHandlerStore {
  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      // makePersistable(this, {
      //   name: this.constructor.name,
      //   properties: [''],
      //   storage: storage,
      // });
    }
  }

  handle = (type: ErrorType) => {
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

const instance = new ErrorHandlerStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as ErrorHandler};
