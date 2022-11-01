//
//  Mnemonic.swift
//  haqq
//
//  Created by Andrey Makarov on 01.11.2022.
//

import Foundation
import CryptoSwift

func bytesToBits(bytes: [UInt8]) -> String {
  return String(bytes.flatMap { ("00000000" + String($0, radix:2)).suffix(8) })
}

public class Mnemonic {
  static func generateEntropy(strength: Int = 16) -> [UInt8] {
    var bytes = [UInt8](repeating: 0, count: strength)
    _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
    
    return bytes
  }
  
  static func deriveChecksumBits(bytes: [UInt8]) -> String {
    let ENT = bytes.count * 8;
    let CS = ENT / 32;
    return String(bytesToBits(bytes: Digest.sha256(bytes)).prefix(CS))
  }
  
  var mnemonic: [String]
  var passphrase: String = ""
  
  var seed: [UInt8] {
    get {
      let mnemonicBytes = Array(mnemonic.joined(separator: "").utf8)
      let saltBytes = Array("mnemonic\(passphrase)".utf8)
      
      let seed = try! PKCS5.PBKDF2(
          password: mnemonicBytes,
          salt: saltBytes,
          iterations: 2048,
          keyLength: 64,
          variant: .sha512
      ).calculate()
      
      return seed
    }
  }
  
  var isValid: Bool {
    get {
      var bits = ""
      for word in mnemonic {
          guard let i = mnemonicWordlist.firstIndex(of: word) else {
            return false
          }
          bits += ("00000000000" + String(i, radix: 2)).suffix(11)
      }
      
      let dividerIndex = bits.count / 33 * 32
      let entropyBits = String(bits.prefix(dividerIndex))
      let checksumBits = String(bits.suffix(bits.count - dividerIndex))
      
      let entropyBytes = bits.split(by: 8).map {
        UInt8($0 , radix: 2)!
      }
      
      return checksumBits == Mnemonic.deriveChecksumBits(bytes: entropyBytes)
    }
  }

  init(bytes: [UInt8]) {
    let bits = bytesToBits(bytes: bytes) + Mnemonic.deriveChecksumBits(bytes: bytes)
    
    mnemonic = bits.split(by: 11).map {
      let ind = Int($0, radix: 2)!
      return mnemonicWordlist[ind]
    }
  }
  
  init(phrase: String, pass: String = "") {
    let words = phrase.components(separatedBy: " ")
    
    mnemonic = words
    passphrase = pass
  }
  
  init(words: [String], pass: String = "") {
    mnemonic = words
    passphrase = pass
  }
}
