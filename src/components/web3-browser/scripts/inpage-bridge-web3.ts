import RNFS from 'react-native-fs';

import {IS_ANDROID} from '@app/variables/common';

const BRIDGES_FILE_NAMES = [
  // https://github.com/MetaMask/mobile-provider
  'metamask-mobile-provider.js', // metamask ethereum provider
  // https://github.com/haqq-network/haqq-keplr-mobile-provider
  'keplr-mobile-provider.js', // keplr cosmos provider
];

export const InpageBridgeWeb3 = {
  script: '',

  async loadScript() {
    if (this.script) {
      return this.script;
    }

    const scripts = await Promise.all(
      BRIDGES_FILE_NAMES.map(this._loadScriptFile),
    );

    this.script = scripts
      .map((script, i) => {
        return `
        try {
          /* ${BRIDGES_FILE_NAMES[i]} */
          ${script}
        } catch (e) {
          console.error('[HAQQ WALLET] ${BRIDGES_FILE_NAMES[i]} init error', e);
        }
        true;
      `;
      })
      .join('\ntrue;\n');
    return this.script;
  },

  async _loadScriptFile(filename: string): Promise<string> {
    if (IS_ANDROID) {
      // When use the `await` operator, Android cannot find the file filename.js
      // Error: ENOENT: /filename.js: open failed: ENOENT (No such file or directory), open 'undefined/filename.js'
      return new Promise<string>((resolve, reject) => {
        RNFS.readFileAssets(`custom/${filename}`, 'utf8')
          .then(script => {
            resolve(script);
          })
          .catch(err => {
            reject(err);
          });
      });
    }

    const script = await RNFS.readFile(
      `${RNFS.MainBundlePath}/${filename}`,
      'utf8',
    );
    return script;
  },
};
