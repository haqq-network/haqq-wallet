//
//  Version.swift
//  haqq
//
//  Created by Andrey Makarov on 25.10.2022.
//

import Foundation

@objc(RNVersion)
class RNVersion: NSObject {
  var appVersion: String? {
    return Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String
  }
  
  var buildNumber: String? {
    return Bundle.main.infoDictionary?["CFBundleVersion"] as? String
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool { return false }
  
  @objc
  public func constantsToExport() -> [AnyHashable : Any]! {
    return ["appVersion": appVersion ?? "unknown", "buildNumber": buildNumber ?? "unknown"]
  }
}
