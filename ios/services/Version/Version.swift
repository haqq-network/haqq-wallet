//
//  Version.swift
//  haqq
//
//  Created by Andrey Makarov on 25.10.2022.
//

import Foundation
import AdSupport
import WebKit

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
  
  func getDeviceModel() -> String {
      let deviceModel = UIDevice.current.model
      let deviceName = UIDevice.modelName
      let osVersion = UIDevice.current.systemVersion
    
      return "(\(deviceModel); CPU \(deviceModel) OS \(osVersion) like Mac OS X)"
  }

  func getOperatingSystem() -> String {
      let osVersion = UIDevice.current.systemVersion
      let osName = UIDevice.current.systemName
    
      return "\(osName) \(osVersion)"
  }
  
  func getAppForUserAgent() -> String {
    return "\(appName ?? "unknown")/\(appVersion  ?? "unknown").\(buildNumber  ?? "unknown")"
  }
  
  func getWebKitVersion(completion: @escaping (String) -> Void) {
      DispatchQueue.main.async {
        let webView = WKWebView(frame: .zero)
        let configuration = webView.configuration
        let applicationName = configuration.applicationNameForUserAgent ?? ""
        
        completion(applicationName)
      }
  }

  func buildUserAgentString() -> String {
      var userAgentString = ""
      let group = DispatchGroup()
      group.enter()
      getWebKitVersion { [self] webKitVersion in
          let userAgentComponents = [
              getAppForUserAgent(),
              getDeviceModel(),
              "AppleWebKit/\(webKitVersion)",
              "(KHTML, like Gecko)",
              getOperatingSystem()
          ]
          userAgentString = userAgentComponents.joined(separator: " ")
          group.leave()
      }
      group.wait()
      return userAgentString
  }

  
  @objc
  public func constantsToExport() -> [AnyHashable : Any]! {
    return [
      "appVersion": appVersion ?? "unknown",
      "buildNumber": buildNumber ?? "unknown",
      "adId": adId,
      "isTrackingEnabled": isTrackingEnabled,
      "userAgent": buildUserAgentString(),
    ]
  }
}
