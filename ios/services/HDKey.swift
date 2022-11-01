//
//  HDKey.swift
//  haqq
//
//  Created by Andrey Makarov on 01.11.2022.
//

import Foundation
import CryptoSwift
import secp256k1_swift

enum HDKeyError: Error {
  case seed;
  case publicKey
}


public class HDKey {
  static var masterSecret = Array("Bitcoin seed".utf8)
  
  var privateKey: [UInt8]
  var chainCode: [UInt8]
  
  var publicKey: [UInt8]? {
    get {
      guard let pub = SECP256K1.privateToPublic(privateKey: Data(privateKey), compressed: true) else {
        return nil
      }
      
      return Array(pub)
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
}
