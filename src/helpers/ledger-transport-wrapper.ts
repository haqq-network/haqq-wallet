import {
  ProviderInterface,
  ProviderLedgerBase,
  ProviderLedgerEvm,
} from '@haqq/rn-wallet-providers';

import {ModalName, awaitForBluetooth, awaitForLedger, hideModal} from './';
import {ExtractPromiseType} from '../types';

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
  let result;
  try {
    if (
      transport instanceof ProviderLedgerBase ||
      transport instanceof ProviderLedgerEvm
    ) {
      await awaitForBluetooth();
      // no need await here
      awaitForLedger(transport);
    }
    result = (await cb()) as ExtractPromiseType<ReturnType>;
  } catch (err) {
    Logger.error('ledgerTransportCbWrapper error: ', err);
    throw err;
  } finally {
    MODALS_TO_CLOSE.forEach(hideModal);
  }
  return result;
};
