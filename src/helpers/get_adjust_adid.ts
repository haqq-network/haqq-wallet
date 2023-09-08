import {Adjust} from 'react-native-adjust';

export async function getAdjustAdid(): Promise<string | undefined> {
  return await new Promise(resolve => {
    Adjust.getAdid(resp => {
      resolve(resp);
    });
  });
}
