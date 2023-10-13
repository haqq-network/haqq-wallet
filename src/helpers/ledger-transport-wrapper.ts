import {ProviderInterface} from '@haqq/provider-base';
import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {hideModal, showModal} from './';
import {ExtractPromiseType} from '../types';

const WAIT_FOR_CONNECTION_TIME = 5_000;

export const ledgerTransportCbWrapper = async <ReturnType>(
  transport: ProviderInterface,
  cb: () => ReturnType | Promise<ReturnType>,
): Promise<ExtractPromiseType<ReturnType>> => {
  const timeount = setTimeout(() => {
    if (transport instanceof ProviderLedgerReactNative) {
      showModal('ledgerLocked');
      Promise.reject('ledgerTransportCbWrapper timeout');
    }
  }, WAIT_FOR_CONNECTION_TIME);

  const result = (await cb()) as ExtractPromiseType<ReturnType>;
  clearTimeout(timeount);
  hideModal('ledgerLocked');
  return result;
};
