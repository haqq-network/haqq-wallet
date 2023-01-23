import {NativeModules} from 'react-native';

import {ETH_HD_PATH} from '../variables/common';

const {RNEthUtils} = NativeModules;

const hexStringToByteArray = (hexString: string | number[]) => {
  if (Array.isArray(hexString)) {
    return hexString;
  }
  return Array.from({length: hexString.length / 2}).map((_, i) =>
    parseInt(hexString.substring(i * 2, (i + 1) * 2), 16),
  );
};

export const generateMnemonic = (strength = 16) => {
  return RNEthUtils.generateMnemonic(strength);
};

export const restoreFromPrivateKey = (privateKey: string) => {
  return RNEthUtils.restoreFromPrivateKey(privateKey).then((resp: string) =>
    JSON.parse(resp),
  );
};

export const restoreFromMnemonic = (mnemonic: string, path = ETH_HD_PATH) => {
  return RNEthUtils.restoreFromMnemonic(mnemonic, path).then((resp: string) =>
    JSON.parse(resp),
  );
};

export const sign = (privateKey: string, phrase: string) => {
  console.log(privateKey, phrase);
  return RNEthUtils.sign(privateKey, phrase).then((resp: string) => {
    console.log('resp', resp);
    return hexStringToByteArray(resp);
  });
};
