import {NativeModules} from 'react-native';

const {Aes} = NativeModules;

/**
 * Class that exposes two public methods: Encrypt and Decrypt
 * This is used by the KeyringController to encrypt / decrypt the state
 * which contains sensitive seed words and addresses
 */

function _generateSalt(byteCount = 32) {
  const view = new Uint8Array(byteCount);
  global.crypto.getRandomValues(view);
  // eslint-disable-next-line no-undef
  const b64encoded = btoa(String.fromCharCode.apply(null, view));
  return b64encoded;
}

const _keyFromPassword = (password: string, salt: string) => {
  return Aes.pbkdf2(password, salt, 5000, 256);
};
const _encryptWithKey = async (text: string, keyBase64: string) => {
  try {
    console.log('_encryptWithKey enter');
    const iv = await Aes.randomKey(16);
    console.log('_encryptWithKey iv', text, iv, keyBase64);
    return Aes.encrypt(text, keyBase64, iv, 'aes-256-cbc')
      .then(cipher => ({
        cipher,
        iv,
      }))
      .catch(e => {
        console.log('_encryptWithKey encrypt', e, e.message);
      });
  } catch (e) {
    console.log('_encryptWithKey catch', e);
  }
};

const _decryptWithKey = (encryptedData, key) =>
  Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-256-cbc');

/**
 * Encrypts a JS object using a password (and AES encryption with native libraries)
 *
 * @param {string} password - Password used for encryption
 * @param {object} object - Data object to encrypt
 * @returns - Promise resolving to stringified data
 */
export const encrypt = async (password, object) => {
  console.log('encrypt');
  const salt = _generateSalt(16);
  console.log('encrypt salt');
  const key = await _keyFromPassword(password, salt);
  console.log('encrypt key');
  const result = await _encryptWithKey(JSON.stringify(object), key);
  console.log('encrypt result');
  result.salt = salt;
  result.lib = 'original';
  return JSON.stringify(result);
};

/**
 * Decrypts an encrypted JS object (encryptedString)
 * using a password (and AES decryption with native libraries)
 *
 * @param {string} password - Password used for decryption
 * @param {string} encryptedString - String to decrypt
 * @returns - Promise resolving to decrypted data object
 */
export const decrypt = async (password: string, encryptedString: string) => {
  console.log('decrypt');
  const encryptedData = JSON.parse(encryptedString);
  console.log('decrypt data');
  const key = await _keyFromPassword(password, encryptedData.salt);
  console.log('decrypt key');
  const data = await _decryptWithKey(encryptedData, key);
  console.log('decrypt result');
  return JSON.parse(data);
};
