import {app} from '@app/contexts';
import {navigator} from '@app/navigator';
import {RootStackParamList} from '@app/types';

export type AwaitJsonRpcSignParams = RootStackParamList['jsonRpcSign'];

export class AwaitJsonRpcSignError {
  name = 'AwaitJsonRpcSignError';
  message?: string;

  constructor(message?: string) {
    this.message = message;
  }
}

export async function awaitForJsonRpcSign(
  params: AwaitJsonRpcSignParams,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const removeAllListeners = () => {
      app.removeListener('json-rpc-sign-success', onAction);
      app.removeListener('json-rpc-sign-reject', onReject);
    };

    const onAction = (address: string) => {
      removeAllListeners();
      resolve(address);
    };

    const onReject = (error: Error | string) => {
      removeAllListeners();
      if (typeof error === 'string') {
        reject(new AwaitJsonRpcSignError(error || 'rejected by user'));
      } else {
        reject(error);
      }
    };

    app.addListener('json-rpc-sign-success', onAction);
    app.addListener('json-rpc-sign-reject', onReject);

    return navigator.navigate('jsonRpcSign', params);
  });
}
