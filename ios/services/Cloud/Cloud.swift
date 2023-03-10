//
//  Cloud.swift
//  haqq
//
//  Created by Andrey Makarov on 10.03.2023.
//

import Foundation

@objc(RNCloud)
class RNCloud: NSObject {
  var isSupported: Bool {
    return true
  }

  let fileManager = FileManager.default

  struct DocumentsDirectory {
      static var localDocumentsURL: URL? {
          return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
      }
      static var iCloudDocumentsURL: URL? {
          return FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents")
      }
  }

  var documentDiretoryURL: URL {
    if isCloudEnabled {
          return DocumentsDirectory.iCloudDocumentsURL!
      } else {
          return DocumentsDirectory.localDocumentsURL!
      }
  }

  //// Return true if iCloud is enabled
  var isCloudEnabled: Bool {
      if DocumentsDirectory.iCloudDocumentsURL != nil {
        return true
      } else {
        return false
      }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool { return false }

  @objc
  public func constantsToExport() -> [AnyHashable : Any]! {
    return ["isSupported": isSupported, "isEnabled": isCloudEnabled]
  }

  @objc
  public func hasItem(_ key: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    do {
      let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!.appendingPathComponent("backups")
      let fileUrl = nestedFolderURL.appendingPathComponent(key)
      let exists = fileManager.fileExists(atPath: fileUrl.path)
      resolve(exists)
    }
    catch {
      reject("0", "hasItem \(error)", nil)
    }
  }

  @objc
  public func getItem(_ key: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    do {
      let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!.appendingPathComponent("backups")

      let fileUrl = nestedFolderURL.appendingPathComponent(key)

      let text2 = try String(contentsOf: fileUrl, encoding: .utf8)
      resolve(text2)
    }
    catch {
      reject("0", "getItem \(error)", nil)
    }
  }

  @objc
  public func setItem(_ key: String, value: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    guard isCloudEnabled else {
      return
    }

    let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!.appendingPathComponent("backups")

    let fileUrl = nestedFolderURL.appendingPathComponent(key)
    do {
        try value.write(to: fileUrl, atomically: true, encoding: .utf8)
        resolve(true)
    }
    catch {
      reject("0", "setItem \(error)", nil)
    }
  }

  @objc
  public func removeItem(_ key: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    do {
      let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!.appendingPathComponent("backups")
      let fileUrl = nestedFolderURL.appendingPathComponent(key)
      if fileManager.fileExists(atPath: fileUrl.path) {
        try fileManager.removeItem(at: fileUrl)
      }
      resolve(true)
    }
    catch {
      reject("0", "removeItem \(error)", nil)
    }
  }
}
