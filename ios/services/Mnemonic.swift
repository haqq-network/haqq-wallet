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

func deriveChecksumBits(bytes: [UInt8]) -> String {
  let ENT = bytes.count * 8;
  let CS = ENT / 32;
  return String(bytesToBits(bytes: Digest.sha256(bytes)).prefix(CS))
}

func getPassphrase(bytes: [UInt8]) -> [String] {
  let bits = bytesToBits(bytes: bytes) + deriveChecksumBits(bytes: bytes)
  
  var phrase = [String]()
  for i in 0..<(bits.count / 11) {
      let ind = i*11
      let wi = Int(bits.substring(from: i*11, to: (i+1) * 11), radix: 2)!
      phrase.append(String(mnemonicWordlist[wi]))
  }
  
  return phrase
}

class Mnemonic {
  public static func getEntropy(strength: Int = 16) -> [UInt8] {
    var bytes = [UInt8](repeating: 0, count: strength)
    _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
    
    return bytes
  }
  
  init(strength: Int = 16) {
    var bytes = [UInt8](repeating: 0, count: strength)
    _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
    
    let bits = bytesToBits(bytes: bytes) + deriveChecksumBits(bytes: bytes)
    
    var phrase = [String]()
    for i in 0..<(bits.count / 11) {
        let ind = i*11
        let wi = Int(bits.substring(from: i*11, to: (i+1) * 11), radix: 2)!
        phrase.append(String(mnemonicWordlist[wi]))
    }
  }
  
  public init(phrase: [String], passphrase: String = "") throws {
      if (!Mnemonic.isValid(phrase: phrase)) {
          throw Error.invalidMnemonic
      }
    
      self.phrase = phrase
      self.passphrase = passphrase
  }
  
  public init(entropy: [UInt8], wordlist: [String] = Wordlists.english) throws {
      self.phrase = try Mnemonic.toMnemonic(entropy, wordlist: wordlist)
      self.passphrase = ""
  }
  
  // Entropy -> Mnemonic
  public static func toMnemonic(_ bytes: [UInt8]) throws -> [String] {
      let entropyBits = bytesToBits(bytes: bytes)
    let checksumBits = deriveChecksumBits(bytes: bytes)
      let bits = entropyBits + checksumBits
      
      var phrase = [String]()
      for i in 0..<(bits.count / 11) {
          let wi = Int(bits[bits.index(bits.startIndex, offsetBy: i * 11)..<bits.index(bits.startIndex, offsetBy: (i + 1) * 11)], radix: 2)!
          phrase.append(String(wordlist[wi]))
      }
      return phrase
  }
  
  // Mnemonic -> Entropy
  public static func toEntropy(_ phrase: [String], wordlist: [String] = Wordlists.english) throws -> [UInt8] {
      let bits = phrase.map { (word) -> String in
          let index = wordlist.firstIndex(of: word)!
          var str = String(index, radix:2)
          while str.count < 11 {
              str = "0" + str
          }
          return str
      }.joined(separator: "")
      
      let dividerIndex = Int(Double(bits.count / 33).rounded(.down) * 32)
      let entropyBits = String(bits.prefix(dividerIndex))
      let checksumBits = String(bits.suffix(bits.count - dividerIndex))
      
      let regex = try! NSRegularExpression(pattern: "[01]{1,8}", options: .caseInsensitive)
      let entropyBytes = regex.matches(in: entropyBits, options: [], range: NSRange(location: 0, length: entropyBits.count)).map {
          UInt8(strtoul(String(entropyBits[Range($0.range, in: entropyBits)!]), nil, 2))
      }
      if (checksumBits != Mnemonic.deriveChecksumBits(entropyBytes)) {
          throw Error.invalidMnemonic
      }
      return entropyBytes
  }
  
  public static func isValid(phrase: [String], wordlist: [String] = Wordlists.english) -> Bool {
      var bits = ""
      for word in phrase {
          guard let i = wordlist.firstIndex(of: word) else { return false }
          bits += ("00000000000" + String(i, radix: 2)).suffix(11)
      }
      
      let dividerIndex = bits.count / 33 * 32
      let entropyBits = String(bits.prefix(dividerIndex))
      let checksumBits = String(bits.suffix(bits.count - dividerIndex))
      
      let regex = try! NSRegularExpression(pattern: "[01]{1,8}", options: .caseInsensitive)
      let entropyBytes = regex.matches(in: entropyBits, options: [], range: NSRange(location: 0, length: entropyBits.count)).map {
          UInt8(strtoul(String(entropyBits[Range($0.range, in: entropyBits)!]), nil, 2))
      }
      return checksumBits == deriveChecksumBits(entropyBytes)
  }
  

  public var seed: [UInt8] {
      let mnemonic = self.phrase.joined(separator: " ")
      let salt = ("mnemonic" + self.passphrase)
      return try! PKCS5.PBKDF2SHA512(password: mnemonic, salt: salt)
  }
}
