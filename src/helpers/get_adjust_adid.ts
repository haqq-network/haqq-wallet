import {Adjust} from 'react-native-adjust';
import EncryptedStorage from 'react-native-encrypted-storage';

export async function getAdjustAdid(): Promise<string | null> {
  let adid = await EncryptedStorage.getItem('adid');

  if (!adid) {
    adid = await new Promise(resolve => {
      Adjust.getAdid(resp => {
        resolve(resp);
      });
    });

    if (adid) {
      await EncryptedStorage.setItem('adid', adid);
    }
  }

  return adid;
}
