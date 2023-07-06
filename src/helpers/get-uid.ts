import EncryptedStorage from 'react-native-encrypted-storage';
import shajs from 'sha.js';

import {getAdId} from '@app/services/version';
import {makeID} from '@app/utils';

export async function getUid() {
  let uid = await EncryptedStorage.getItem('uid');

  if (!uid) {
    const adid = getAdId();
    if (adid && adid !== 'unknown') {
      uid = shajs('sha256').update(adid).digest('hex');
      await EncryptedStorage.setItem('uid', uid);
    }
  }

  if (!uid) {
    uid = shajs('sha256').update(makeID(10)).digest('hex');
    await EncryptedStorage.setItem('uid', uid);
  }

  return uid ?? '';
}
