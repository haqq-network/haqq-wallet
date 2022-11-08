//
//  Encryption.swift
//  haqq
//
//  Created by Andrey Makarov on 22.09.2022.
//

import Foundation
import CryptoSwift

enum RNEncryptionError: Error {
  case randomKey;
  case pbfdk2;
  case keyFromPassword;
  case params;
  case encodeJson;
  case decodeJson;
  case decrypt;
}

enum RNEncryptionMethod: String, Codable {
  case js;
  case aes;
  case chacha;
}

struct EncryptedResult: Codable {
  var cipher: String
  var iv: String
  var salt: String;
  var method: RNEncryptionMethod;
}

@objc(RNEncryption)
class RNEncryption: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool { return false }

  @objc
  public func resolvePromise(_ param: String, second: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    resolve("CustomMethods.resolvePromise('\(param)', '\(second)')")
  }

  @objc
  public func encrypt(_ password: Optional<String>, data: Optional<String>, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    do {
      guard let password = password, let data = data else {
        throw RNEncryptionError.params;
      }

      guard let salt = randomKey(count: 16) else {
        throw RNEncryptionError.randomKey;
      }

      guard let key = try keyFromPassword(password: password, salt: salt) else {
        throw RNEncryptionError.keyFromPassword;
      }

      let result = try encryptWithKey(key: key, data: data);

      let jsonEncoder = JSONEncoder();

      let encryptedResult = EncryptedResult(cipher: result.0, iv: result.1, salt: salt, method: .chacha);

      guard let encode = try? jsonEncoder.encode(encryptedResult) else {
        throw RNEncryptionError.encodeJson;
      }

      guard let resp = String(data: encode, encoding: .utf8) else {
        throw RNEncryptionError.encodeJson;
      }

      resolve(resp);
    } catch {
      logger("encrypt \(error)")
      reject("0", "encrypt error", nil)
    }
  }

  @objc
  public func decrypt(_ password: String, data: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    let encryptedData = Data(data.utf8)
    let jsonDecoder = JSONDecoder()

    do {
      let decodedResult = try jsonDecoder.decode(EncryptedResult.self, from: encryptedData);
      guard let key = try keyFromPassword(password: password, salt: decodedResult.salt) else {
        throw RNEncryptionError.keyFromPassword;
      }
      guard let result = try decryptWithKey(key: key, cipher: decodedResult.cipher, iv: decodedResult.iv) else {
        throw RNEncryptionError.decrypt;
      }

      resolve(result);
    } catch {
      logger("decrypt \(error)")
      reject("0", "decrypt error", nil)
    }
  }

  func randomKey(count: Int) -> String? {
    var keyData = Data(count: count)
    let result = keyData.withUnsafeMutableBytes {
        SecRandomCopyBytes(kSecRandomDefault, 32, $0.baseAddress!)
    }
    if result == errSecSuccess {
        return keyData.base64EncodedString()
    } else {
        logger("Problem generating random bytes")
        return nil
    }
  }

  func encryptWithKey(key: [UInt8], data: String) throws -> (String, String) {
    let iv = ChaCha20.randomIV(12)
    let chacha = try ChaCha20(key: key, iv: iv)
    let cipher = try chacha.encrypt(Array(data.utf8))

    return (Data(cipher).base64EncodedString(), Data(iv).base64EncodedString())
  }

  func decryptWithKey(key: [UInt8], cipher: String, iv: String) throws -> String? {
    let iv = Data(base64Encoded: iv, options: .ignoreUnknownCharacters)!;

    let chacha = try ChaCha20(key: key, iv: iv.bytes)

    let cipher = Data(base64Encoded: cipher, options: .ignoreUnknownCharacters)!

    let result = try chacha.decrypt(cipher.bytes);

    return String(data: Data(result), encoding: .utf8);
  }

  func keyFromPassword(password: String, salt: String) throws -> [UInt8]? {
    do {
      let password: Array<UInt8> = Array(password.utf8)
      let salt: Array<UInt8> = Array(salt.utf8)

      let key = try PKCS5.PBKDF2(password: password, salt: salt, iterations: 4096, keyLength: 32, variant: .sha2(.sha256)).calculate()

      return key
    } catch {
      logger("keyFromPassword \(error)");

      return nil;
    }
  }
}
