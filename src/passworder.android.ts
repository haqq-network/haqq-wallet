import {NativeModules} from 'react-native';

const {Aes, RNEncryption} = NativeModules;

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
    const iv = await Aes.randomKey(16);
    return Aes.encrypt(text, keyBase64, iv, 'aes-256-cbc').then(cipher => ({
      cipher,
      iv,
    }));
  } catch (e) {
    console.log('_encryptWithKey catch', e);
  }
};

const _decryptWithKey = (encryptedData, key: string) =>
  Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-256-cbc');

/**
 * Encrypts a JS object using a password (and AES encryption with native libraries)
 *
 * @param {string} password - Password used for encryption
 * @param {object} object - Data object to encrypt
 * @returns - Promise resolving to stringified data
 */
export const encrypt = async (password, object) => {
  const salt = _generateSalt(16);
  const key = await _keyFromPassword(password, salt);
  const result = await _encryptWithKey(JSON.stringify(object), key);
  result.salt = salt;
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
  const encryptedData = JSON.parse(encryptedString);
  const key = await _keyFromPassword(password, encryptedData.salt);
  const data = await _decryptWithKey(encryptedData, key);
  return JSON.parse(data);
};

export const testEncrypt = RNEncryption.encrypt;
export const testDecrypt = RNEncryption.decrypt;
