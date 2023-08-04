//
//  AppNativeConfig.swift
//  haqq
//
//  Created by Kira on 03.08.2023.
//
import Foundation

@objc(AppNativeConfig)
class AppNativeConfig: NSObject {
  
  @objc(setBoolean:forKey:resolver:rejecter:)
  func setBoolean(value: Bool, forKey key: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) -> Void {
    guard let configKey = BooleanConfigKey(rawValue: key) else {
      rejecter("ERROR", "Invalid key", nil)
      return
    }
    
    BooleanConfig.shared.storage[configKey] = value
    resolver(nil)
  }
  
  @objc(getBoolean:resolver:rejecter:)
  func getBoolean(forKey key: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) -> Void {
    guard let configKey = BooleanConfigKey(rawValue: key), let value = BooleanConfig.shared.storage[configKey] else {
      rejecter("ERROR", "Invalid key or no value for key", nil)
      return
    }
    
    resolver(value)
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

