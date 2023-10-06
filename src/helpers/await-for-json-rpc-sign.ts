import {hashMessage} from '@walletconnect/utils';
import {Keyboard} from 'react-native';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {navigator} from '@app/navigator';
import {RootStackParamList} from '@app/types';
import {sleep} from '@app/utils';

export type AwaitJsonRpcSignParams = RootStackParamList['jsonRpcSign'];

const logger = Logger.create('AwaitJsonRpcSign', {
  enabled: DEBUG_VARS.enableAwaitJsonRpcSignLogger,
});

export class AwaitJsonRpcSignError {
  name = 'AwaitJsonRpcSignError';
  message?: string;

  constructor(message?: string) {
    this.message = message;
  }
}

let queue: Array<{
  params: AwaitJsonRpcSignParams;
  resolve: Function;
  reject: Function;
}> = [];
let isProcessing = false;

async function processNextInQueue() {
  if (isProcessing || queue.length === 0) {
    return;
  }
  Keyboard.dismiss();

  isProcessing = true;
  let isFinish = false;

  const {params, resolve, reject} = queue.shift()!;

  logger.log(
    '🟣 start sign operation for: ',
    params.selectedAccount,
    params.request.method,
  );
  logger.log('🟣 params hash: ', hashMessage(JSON.stringify(params)));
  logger.log('🟣 queue length: ', queue.length);

  const removeAllListeners = async () => {
    app.removeListener('json-rpc-sign-success', onAction);
    app.removeListener('json-rpc-sign-reject', onReject);
    await sleep(1000);
    isProcessing = false;
    logger.log(
      '✅ operation finish: ',
      params.selectedAccount,
      params.request.method,
    );
    logger.log('✅ params hash: ', hashMessage(JSON.stringify(params)));

    processNextInQueue(); // Continue with the next item in the queue
  };

  const onAction = (address: string) => {
    if (isFinish) {
      return;
    }
    isFinish = true;
    resolve(address);

    logger.log('🟢 sign operation done for wallet: ', params.selectedAccount);
    logger.log('🟢 params hash: ', hashMessage(JSON.stringify(params)));
    logger.log('🟢 queue length: ', queue.length);

    removeAllListeners();
  };

  const onReject = (error: Error | string) => {
    if (isFinish) {
      return;
    }
    isFinish = true;
    if (typeof error === 'string') {
      reject(new AwaitJsonRpcSignError(error || 'rejected by user'));
    } else {
      reject(error);
      logger.captureException(error, 'onReject');
    }

    logger.error(error);
    logger.log('🔴 sign operation error for wallet: ', params.selectedAccount);
    logger.log('🔴 params hash: ', hashMessage(JSON.stringify(params)));
    logger.log('🔴 queue length: ', queue.length);

    removeAllListeners();
  };

  app.addListener('json-rpc-sign-success', onAction);
  app.addListener('json-rpc-sign-reject', onReject);
  await navigator.navigate('jsonRpcSign', params);
}

export async function awaitForJsonRpcSign(
  params: AwaitJsonRpcSignParams,
): Promise<string> {
  return new Promise((resolve, reject) => {
    logger.log('🟡 sign operation for wallet: ', params.selectedAccount);
    logger.log('🟡 sign operation request: ', params.request);
    logger.log('🟡 sign operation metadata: ', params.metadata);
    logger.log('🟡 params hash: ', hashMessage(JSON.stringify(params)));
    logger.log('🟡 queue length: ', queue.length);
    logger.log('🟡 in progress: ', isProcessing);

    queue.push({params, resolve, reject});
    if (!isProcessing) {
      processNextInQueue();
    }
  });
}
