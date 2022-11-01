//
//  EthUtils.swift
//  haqq
//
//  Created by Andrey Makarov on 01.11.2022.
//

import Foundation


@objc(RNEncryption)
class RNEthUtils: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool { return false }
  
  @objc
  public func generate(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    resolve("CustomMethods.resolvePromise")
  }
}
