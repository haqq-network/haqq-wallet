import {hashMessage} from '@walletconnect/utils';

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
  logger.log('🟣 call processNextInQueue');
  logger.log('🟣 queue length: ', queue.length);

  isProcessing = true;
  let isFinish = false;

  const {params, resolve, reject} = queue.shift()!;
  logger.log('🟣 shift params account: ', params.selectedAccount);
  logger.log('🟣 params hash: ', hashMessage(JSON.stringify(params)));

  const removeAllListeners = async () => {
    app.removeListener('json-rpc-sign-success', onAction);
    app.removeListener('json-rpc-sign-reject', onReject);
    logger.log('🔴 FINISH');
    logger.log('🔴 queue length: ', queue.length);
    logger.log('🔴 shift params account: ', params.selectedAccount);
    logger.log('🔴 params hash: ', hashMessage(JSON.stringify(params)));
    await sleep(1000);
    isProcessing = false;
    processNextInQueue(); // Continue with the next item in the queue
  };

  const onAction = (address: string) => {
    if (isFinish) {
      return;
    }
    isFinish = true;
    resolve(address);
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
    logger.log('🟠 call awaitForJsonRpcSign: ', params.selectedAccount);
    logger.log('🟠 queue length: ', queue.length);
    logger.log('🟠 isProcessing: ', isProcessing);
    logger.log('🟠 params hash: ', hashMessage(JSON.stringify(params)));

    queue.push({params, resolve, reject});
    if (!isProcessing) {
      processNextInQueue();
    }
  });
}
