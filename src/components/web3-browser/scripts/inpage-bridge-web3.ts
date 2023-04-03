import RNFS from 'react-native-fs';

import {IS_ANDROID} from '@app/variables/common';

export const InpageBridgeWeb3 = {
  script: '',
  async loadScript() {
    if (IS_ANDROID) {
      // When use the `await` operator, Android cannot find the file InpageBridgeWeb3.
      // Error: ENOENT: /InpageBridgeWeb3.js: open failed: ENOENT (No such file or directory), open 'undefined/InpageBridgeWeb3.js'
      return new Promise<string>((resolve, reject) => {
        RNFS.readFileAssets('custom/InpageBridgeWeb3.js', 'utf8')
          .then(script => {
            this.script = script;
            resolve(script);
          })
          .catch(err => {
            reject(err);
          });
      });
    }

    const script = await RNFS.readFile(
      `${RNFS.MainBundlePath}/InpageBridgeWeb3.js`,
      'utf8',
    );
    this.script = script;
    return this.script;
  },
};
