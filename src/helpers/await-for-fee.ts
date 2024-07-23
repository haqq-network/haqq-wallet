import {app} from '@app/contexts';
import {Fee} from '@app/models/fee';
import {navigator} from '@app/navigator';
import {TransactionStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {Eventable} from '@app/types';

export interface AwaitForWalletParams {
  fee: Fee;
  from: string;
  to: string;
  value?: Balance;
  data?: string;

  eventSuffix?: string | number;
}

export enum AwaitForFeeEvents {
  success = 'fee-applyed',
  error = 'fee-settings-closed',
}

const event: Eventable = {
  successEventName: AwaitForFeeEvents.success,
  errorEventName: AwaitForFeeEvents.error,
};

export async function awaitForFee({
  fee,
  from,
  to,
  value,
  data,
}: AwaitForWalletParams): Promise<Fee> {
  return new Promise((resolve, reject) => {
    const removeAllListeners = () => {
      app.removeListener(event.successEventName, onAction);
      app.removeListener(event.errorEventName, onReject);
    };

    const onAction = (calculatedFee: Fee) => {
      removeAllListeners();
      resolve(calculatedFee);
    };

    const onReject = () => {
      removeAllListeners();
      reject();
    };

    app.addListener(event.successEventName, onAction);
    app.addListener(event.errorEventName, onReject);

    return navigator.navigate(TransactionStackRoutes.FeeSettings, {
      fee,
      from,
      to,
      value,
      data,
      ...event,
    });
  });
}
