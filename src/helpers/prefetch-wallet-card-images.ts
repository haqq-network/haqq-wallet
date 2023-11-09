import {Image} from 'react-native';

import {Wallet} from '@app/models/wallet';
import {getPatternName} from '@app/utils';

export async function prefetchWalletCardImages() {
  try {
    return await Promise.allSettled(
      Wallet.getAllVisible().map(w =>
        Image.prefetch(getPatternName(w.pattern)),
      ),
    );
  } catch (err) {
    Logger.error('prefetchWalletCardImages Image.prefetch error', err);
  }
}
