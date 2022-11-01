//
//  HDKey.swift
//  haqq
//
//  Created by Andrey Makarov on 01.11.2022.
//

import Foundation
import CryptoSwift
import secp256k1Swift

enum HDKeyError: Error {
  case seed;
  case publicKey
}

func byteArray<T>(from value: T) -> [UInt8] where T: FixedWidthInteger {
    withUnsafeBytes(of: value.bigEndian, Array.init)
}

public class HDKey {
  static var masterSecret = Array("Bitcoin seed".utf8)
  static var hardenedOffset = 0x80000000
  static var virstHardenedIndex: UInt32 = 0b1 << 31
  static var spacer: [UInt8] = [0]
  
  var privateKey: [UInt8]
  var chainCode: [UInt8]
  
  var publicKey: [UInt8] {
    get {
      let privateKey = try! secp256k1.Signing.PrivateKey(rawRepresentation: privateKey)
      return [UInt8](privateKey.publicKey.rawRepresentation)
    }
  }
  
  init(privateKey: [UInt8], chainCode: [UInt8]) {
    self.privateKey = privateKey
    self.chainCode = chainCode
  }
  
  init(seed: [UInt8]) throws {
    let key = try? HMAC(key: HDKey.masterSecret, variant: .sha512).authenticate(seed)
        
    guard let key = key else {
      throw HDKeyError.seed
    }
    
    self.privateKey = Array(key[0..<32])
        self.chainCode = Array(key[32..<64])
  }
  
  public func derive(path: String) -> HDKey? {
    let segments = path.components(separatedBy: "/")
    
    var key: Optional<HDKey> = HDKey(privateKey: privateKey, chainCode: chainCode)
    
    for segment in segments[1...] {
      guard let k = key else {
        return nil
      }
      key = k.deriveChild(segment: segment)
    }

    return key
  }
  
  public func deriveChild(segment: String) -> HDKey? {
      guard var childIndex = UInt32(segment.replacingOccurrences(of: "'", with: "")) else {
          return nil
      }
  
      var hardened = segment.suffix(1) == "'"
      if (hardened) {
          childIndex += UInt32(HDKey.hardenedOffset)
      }
      
    var indexBuffer = byteArray(from: UInt32(childIndex))
      
    var pk = hardened ? HDKey.spacer + privateKey + indexBuffer : publicKey + indexBuffer
    
    let key2 = try? HMAC(key: chainCode, variant: .sha512).authenticate(pk)
      
    guard let key2 = key2 else {
        return nil
    }
      
    let chainCode = Array(key2[32..<64])

    let tweak = try? secp256k1.Signing.PrivateKey(rawRepresentation: privateKey)
      
      guard let tweak = tweak else {
          return nil
      }
      
      let tweak2 = try? tweak.add(Array(key2[0..<32]))
      
      guard let tweak2 = tweak2 else {
          let nextIndex = UInt32(childIndex) + 1
          if hardened {
              return deriveChild(segment: "\(nextIndex)'")
          } else {
              return deriveChild(segment: "\(nextIndex)")
          }
      }
      
      let privatekey = [UInt8](tweak2.rawRepresentation)
      
      return HDKey(privateKey: privatekey, chainCode: Array(key2[32..<64]))
      
  }
}
