//
//  Wallet.swift
//  haqq
//
//  Created by Andrey Makarov on 02.11.2022.
//

import Foundation
import CryptoSwift
import secp256k1Swift

public class Wallet {
  var publicKey: [UInt8] {
    get {
      let privateKey = try! secp256k1.Signing.PrivateKey(rawRepresentation: privateKey)
      return [UInt8](privateKey.publicKey.rawRepresentation)
    }
  }
  
  var address: [UInt8] {
      get {
          let privateKey = try! secp256k1.Signing.PrivateKey(rawRepresentation: privateKey, format: .uncompressed)
          let pk = privateKey.publicKey.rawRepresentation
          let hash = Digest.sha3(Array(pk.subdata(in: 1..<pk.count)), variant: .keccak256)
          return Array(hash[ 12..<hash.count])
      }
  }
  
  var privateKey: [UInt8]
  
  init(privateKey: [UInt8]) {
    self.privateKey = privateKey
  }
  
  init(privateKey: String) {
    self.privateKey = Array(hex: privateKey);
  }
  
  init(hdkey: HDKey) {
    privateKey = hdkey.privateKey
  }
}
