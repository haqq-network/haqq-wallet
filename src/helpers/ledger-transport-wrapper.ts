import {ProviderInterface} from '@haqq/provider-base';
import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {ModalName, awaitForBluetooth, hideModal, showModal} from './';
import {ExtractPromiseType} from '../types';

const WAIT_FOR_CONNECTION_TIME = 5_000;

const MODALS_TO_CLOSE: ModalName[] = [
  'ledgerLocked',
  'ledgerAttention',
  'ledgerNoApp',
  'bluetoothPoweredOff',
  'bluetoothUnauthorized',
];

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

  let result;
  try {
    if (transport instanceof ProviderLedgerReactNative) {
      await awaitForBluetooth();
      // @ts-ignore
      await transport.awaitForTransport(transport._options.deviceId);
    }
    result = (await cb()) as ExtractPromiseType<ReturnType>;
  } catch (err) {
    Logger.error('ledgerTransportCbWrapper error: ', err);
    throw err;
  } finally {
    clearTimeout(timeount);
    MODALS_TO_CLOSE.forEach(hideModal);
  }
  return result;
};
