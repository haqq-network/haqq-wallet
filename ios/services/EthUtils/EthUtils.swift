//
//  EthUtils.swift
//  haqq
//
//  Created by Andrey Makarov on 01.11.2022.
//

import Foundation


@objc(RNEthUtils)
class RNEthUtils: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool { return false }
  
  @objc
  public func generate(_ strength: Optional<NSNumber>, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    let strength =  Int(truncating: strength ?? 16)
    
    let mnemonic = Mnemonic(bytes: Mnemonic.generateEntropy(strength: strength))
    
    if mnemonic.isValid {
      resolve(mnemonic.mnemonic.joined(separator: " "))
    } else {
      reject("0", "generate mnemonic error", nil)
    }
    
  }
}
