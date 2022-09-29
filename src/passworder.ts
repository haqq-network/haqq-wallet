import {NativeModules} from 'react-native';

const {RNEncryption, Aes} = NativeModules;
/**
 * Class that exposes two public methods: Encrypt and Decrypt
 * This is used by the KeyringController to encrypt / decrypt the state
 * which contains sensitive seed words and addresses
 */

const _keyFromPassword = (password: string, salt: string) => {
  return Aes.pbkdf2(password, salt, 5000, 256);
};

const _decryptWithKey = (encryptedData, key: string) =>
  Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-256-cbc');

async function decryptJS(password: string, encryptedString: string) {
  const encryptedData = JSON.parse(encryptedString);
  const key = await _keyFromPassword(password, encryptedData.salt);
  const data = await _decryptWithKey(encryptedData, key);
  return JSON.parse(data);
}

/**
 * Encrypts a JS object using a password (and AES encryption with native libraries)
 *
 * @param {string} password - Password used for encryption
 * @param {object} object - Data object to encrypt
 * @returns - Promise resolving to stringified data
 */
export const encrypt = async (
  password: string,
  object: Record<string, any>,
) => {
  return RNEncryption.encrypt(password, JSON.stringify(object));
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

  switch (encryptedData.method.toLowerCase()) {
    case 'chacha':
    case 'aes':
      return RNEncryption.decrypt(password, encryptedString).then(
        (resp: string) => JSON.parse(resp),
      );
    default:
    case 'js':
      return decryptJS(password, encryptedString);
  }
};
