import {NativeModules} from 'react-native';

import {ETH_HD_PATH} from '../variables/common';

const {RNEthUtils} = NativeModules;

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
