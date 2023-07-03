//
//  Version.swift
//  haqq
//
//  Created by Andrey Makarov on 25.10.2022.
//

import Foundation
import AdSupport

@objc(RNVersion)
class RNVersion: NSObject {
  var appVersion: String? {
    return Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String
  }
  
  var appName: String? {
    return Bundle.main.infoDictionary?["CFBundleName"] as? String
  }
  
  var getCfnVersion: String? {
    return Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String
  }
  
  var buildNumber: String? {
    return Bundle.main.infoDictionary?["CFBundleVersion"] as? String
  }
  
  var isTrackingEnabled: Bool {
    return ASIdentifierManager.shared().isAdvertisingTrackingEnabled
  }
  
  var adId: String {
    if isTrackingEnabled {
      return  ASIdentifierManager.shared().advertisingIdentifier.uuidString;
    }
    
    return "unknown"
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool { return false }
  
  @objc
  public func constantsToExport() -> [AnyHashable : Any]! {
    return [
      "appVersion": appVersion ?? "unknown",
      "buildNumber": buildNumber ?? "unknown",
      "adId": adId,
      "isTrackingEnabled": isTrackingEnabled,
      "userAgent": "\(appName ?? "unknown")/\(appVersion  ?? "unknown").\(buildNumber  ?? "unknown") CFNetwork/\(getCfnVersion  ?? "unknown") Darwin \(UIDevice.modelName) \(UIDevice.current.systemName)/\(UIDevice.current.systemVersion)"
    ]
  }
}
