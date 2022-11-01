//
//  HDKey.swift
//  haqq
//
//  Created by Andrey Makarov on 01.11.2022.
//

import Foundation
import CryptoSwift
import secp256k1Swift

func byteArray<T>(from value: T) -> [UInt8] where T: FixedWidthInteger {
    withUnsafeBytes(of: value.bigEndian, Array.init)
}

struct HDKey {
    static var hardenedOffset = 0x80000000
    static let virstHardenedIndex: UInt32 = 0b1 << 31
    var privateKey: [UInt8]
    var chainCode: [UInt8]
    var fingerprint: [UInt8] = byteArray(from: UInt32(0))
    var index: UInt32 = 0
    var versionPrivate: [UInt8] = byteArray(from: UInt32(0x0488ADE4))
    var versionPublic: [UInt8] = byteArray(from: UInt32(0x0488B21E))
    var depth: UInt32 = 0
    var spacer: [UInt8] = [0]
    
    var publicKey: [UInt8] {
        get {
            let privateKey = try! secp256k1.Signing.PrivateKey(rawRepresentation: privateKey)
            return [UInt8](privateKey.publicKey.rawRepresentation)
        }
    }
  
  var seed: String {
    get {
      return Data(privateKey + chainCode).hexEncodedString()
    }
  }
  
  public func derive(segment: String) -> HDKey? {
    guard var childIndex = UInt32(segment.replacingOccurrences(of: "'", with: "")) else {
      return nil
    }

    var hardened = segment.suffix(1) == "'"
    if (hardened) {
        childIndex += UInt32(HDKey.hardenedOffset)
    }
    
    var indexBuffer = byteArray(from: UInt32(childIndex))
    
    var pk = hardened ? spacer + privateKey + indexBuffer : publicKey + indexBuffer
    print("pk \(segment) \(pk)")
    
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
        return derive(segment: "\(nextIndex)'")
      } else {
        return derive(segment: "\(nextIndex)")
      }
    }
    
    let privatekey = [UInt8](tweak2.rawRepresentation)
    
    return HDKey(privateKey: privatekey, chainCode: Array(key2[32..<64]), index: index+1, depth: depth+1)
      
  }
}
