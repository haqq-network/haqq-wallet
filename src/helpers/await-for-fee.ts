import {app} from '@app/contexts';
import {navigator} from '@app/navigator';
import {TransactionStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {Eventable} from '@app/types';

export interface AwaitForWalletParams {
  from: string;
  to: string;
  amount?: Balance;
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
  from,
  to,
  amount,
  data,
}: AwaitForWalletParams): Promise<string> {
  return new Promise((resolve, reject) => {
    const removeAllListeners = () => {
      app.removeListener(event.successEventName, onAction);
      app.removeListener(event.errorEventName, onReject);
    };

    const onAction = (address: string) => {
      removeAllListeners();
      resolve(address);
    };

    const onReject = () => {
      removeAllListeners();
      reject();
    };

    app.addListener(event.successEventName, onAction);
    app.addListener(event.errorEventName, onReject);

    return navigator.navigate(TransactionStackRoutes.FeeSettings, {
      from,
      to,
      amount,
      data,
      ...event,
    });
  });
}
