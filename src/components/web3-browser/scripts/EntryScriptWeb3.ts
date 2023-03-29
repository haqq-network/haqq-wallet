import RNFS from 'react-native-fs';

import {IS_IOS} from '@app/variables/common';

export const InpageBridgeWeb3 = {
  script: '',
  async loadScript() {
    this.script = IS_IOS
      ? await RNFS.readFile(
          `${RNFS.MainBundlePath}/InpageBridgeWeb3.js`,
          'utf8',
        )
      : await RNFS.readFileAssets('custom/InpageBridgeWeb3.js');
    return this.script;
  },
};
