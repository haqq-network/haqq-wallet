//
//  Cloud.swift
//  haqq
//
//  Created by Andrey Makarov on 10.03.2023.
//

import Foundation
import os.log

@objc(RNCloud)
class RNCloud: NSObject {
  let logger = OSLog(subsystem: Bundle.main.bundleIdentifier ?? "com.haqq.app", category: "RNCloud")
  
  var isSupported: Bool {
    os_log("[isSupported] Checking if cloud storage is supported", log: logger, type: .debug)
    return true
  }

  let fileManager = FileManager.default

  struct DocumentsDirectory {
      static var localDocumentsURL: URL? {
          os_log("[localDocumentsURL] Getting local documents URL", log: OSLog(subsystem: Bundle.main.bundleIdentifier ?? "com.haqq.app", category: "DocumentsDirectory"), type: .debug)
          return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
      }
      static var iCloudDocumentsURL: URL? {
          os_log("[iCloudDocumentsURL] Getting iCloud documents URL", log: OSLog(subsystem: Bundle.main.bundleIdentifier ?? "com.haqq.app", category: "DocumentsDirectory"), type: .debug)
          return FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents")
      }
  }

  var documentDiretoryURL: URL {
    os_log("[documentDiretoryURL] Getting document directory URL", log: logger, type: .debug)
    if isCloudEnabled {
          os_log("[documentDiretoryURL] Using iCloud documents URL", log: logger, type: .debug)
          return DocumentsDirectory.iCloudDocumentsURL!
      } else {
          os_log("[documentDiretoryURL] Using local documents URL", log: logger, type: .debug)
          return DocumentsDirectory.localDocumentsURL!
      }
  }

  //// Return true if iCloud is enabled
  var isCloudEnabled: Bool {
      os_log("[isCloudEnabled] Checking if iCloud is enabled", log: logger, type: .debug)
      if DocumentsDirectory.iCloudDocumentsURL != nil {
        os_log("[isCloudEnabled] iCloud is enabled", log: logger, type: .debug)
        return true
      } else {
        os_log("[isCloudEnabled] iCloud is not enabled", log: logger, type: .debug)
        return false
      }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool { 
    os_log("[requiresMainQueueSetup] Checking if main queue setup is required", log: OSLog(subsystem: Bundle.main.bundleIdentifier ?? "com.haqq.app", category: "RNCloud"), type: .debug)
    return false 
  }

  @objc
  public func constantsToExport() -> [AnyHashable : Any]! {
    os_log("[constantsToExport] Exporting constants", log: logger, type: .debug)
    return ["isSupported": isSupported, "isEnabled": isCloudEnabled]
  }

  @objc
  public func hasItem(_ key: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    os_log("[hasItem] Checking if item exists: %{public}@", log: logger, type: .debug, key)
    ensureFileLoaded(key)
    do {
      let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
      
      os_log("[hasItem] Getting contents of directory: %{public}@", log: logger, type: .debug, nestedFolderURL.path)
      let fileNames = try! self.fileManager.contentsOfDirectory(atPath: nestedFolderURL.path)
      
      for fileName in fileNames {
        os_log("[hasItem] Found file: %{public}@", log: logger, type: .debug, fileName)
      }
      
      let fileUrl = nestedFolderURL.appendingPathComponent(key)
      os_log("[hasItem] Checking if file exists: %{public}@", log: logger, type: .debug, fileUrl.path)
      let exists = self.fileManager.fileExists(atPath: fileUrl.path)
      os_log("[hasItem] File exists: %{public}@", log: logger, type: .debug, exists ? "true" : "false")
      resolve(exists)
    }
    catch {
      os_log("[hasItem] Error in hasItem: %{public}@", log: logger, type: .error, error.localizedDescription)
      reject("0", "hasItem \(error)", nil)
    }
  }

  @objc
  public func getItem(_ key: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
      os_log("[getItem] Getting item: %{public}@", log: logger, type: .debug, key)
      ensureFileLoaded(key)
      do {
        let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
        
        let fileUrl = nestedFolderURL.appendingPathComponent(key)
        
        os_log("[getItem] Reading contents of file: %{public}@", log: logger, type: .debug, fileUrl.path)
        let text2 = try String(contentsOf: fileUrl, encoding: .utf8)
        os_log("[getItem] Successfully read file contents", log: logger, type: .debug)
        resolve(text2)
      }
      catch {
        os_log("[getItem] Error in getItem: %{public}@", log: logger, type: .error, error.localizedDescription)
        reject("0", "getItem \(error)", nil)
      }
  }

  @objc
  public func setItem(_ key: String, value: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    os_log("[setItem] Setting item: %{public}@", log: logger, type: .debug, key)
    guard isCloudEnabled else {
      os_log("[setItem] Cloud is not enabled, cannot set item", log: logger, type: .error)
      return
    }
    os_log("[setItem] Starting setItem operation for key: %{public}@", log: logger, type: .debug, key)
    
    os_log("[setItem] Ensuring file is loaded for key: %{public}@", log: logger, type: .debug, key)
    ensureFileLoaded(key)
    
    os_log("[setItem] Retrieving iCloud Documents URL", log: logger, type: .debug)
    let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
    os_log("[setItem] iCloud Documents URL retrieved: %{public}@", log: logger, type: .debug, nestedFolderURL.path)
    
    os_log("[setItem] Constructing file URL for key: %{public}@", log: logger, type: .debug, key)
    let fileUrl = nestedFolderURL.appendingPathComponent(key)
    os_log("[setItem] File URL constructed: %{public}@", log: logger, type: .debug, fileUrl.path)
    do {
      if self.fileManager.fileExists(atPath: fileUrl.path) {
        os_log("[setItem] Removing existing file: %{public}@", log: logger, type: .debug, fileUrl.path)
        try self.fileManager.removeItem(at: fileUrl)
      }
      
      os_log("[setItem] Writing to file: %{public}@", log: logger, type: .debug, fileUrl.path)
      try value.write(to: fileUrl, atomically: false, encoding: .utf8)
      os_log("[setItem] Successfully wrote to file", log: logger, type: .debug)
      resolve(true)
    }
    catch {
      os_log("[setItem] Error in setItem: %{public}@", log: logger, type: .error, error.localizedDescription)
      reject("0", "setItem \(error)", nil)
    }
  }

  @objc
  public func removeItem(_ key: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    os_log("[removeItem] Removing item: %{public}@", log: logger, type: .debug, key)
    do {
      ensureFileLoaded(key)

      let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
      let fileUrl = nestedFolderURL.appendingPathComponent(key)
      if self.fileManager.fileExists(atPath: fileUrl.path) {
        os_log("[removeItem] Removing file: %{public}@", log: logger, type: .debug, fileUrl.path)
        try self.fileManager.removeItem(at: fileUrl)
        os_log("[removeItem] Successfully removed file", log: logger, type: .debug)
      } else {
        os_log("[removeItem] File does not exist, nothing to remove", log: logger, type: .debug)
      }
      resolve(true)
    }
    catch {
      os_log("[removeItem] Error in removeItem: %{public}@", log: logger, type: .error, error.localizedDescription)
      reject("0", "removeItem \(error)", nil)
    }
  }
  
  func ensureFileLoaded(_ key: String) {
    os_log("[ensureFileLoaded] Ensuring file is loaded: %{public}@", log: logger, type: .debug, key)
    let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
    let fileUrl = nestedFolderURL.appendingPathComponent(key)
    
    do {
      os_log("[ensureFileLoaded] Creating directory if needed: %{public}@", log: logger, type: .debug, nestedFolderURL.path)
      try fileManager.createDirectory(atPath: nestedFolderURL.path, withIntermediateDirectories: true);
    } catch {
      os_log("[ensureFileLoaded] Directory already exists", log: logger, type: .debug)
    }
    if fileManager.fileExists(atPath: fileUrl.path) == true {
        os_log("[ensureFileLoaded] File already exists, no need to load", log: logger, type: .debug)
        return
    }
    
    let cloudFileUrl = nestedFolderURL.appendingPathComponent(".\(key).icloud")

    if fileManager.fileExists(atPath: cloudFileUrl.path) == false {
      os_log("[ensureFileLoaded] iCloud file does not exist, nothing to load", log: logger, type: .debug)
      return
    }
    
    do {
      os_log("[ensureFileLoaded] Starting download of ubiquitous item: %{public}@", log: logger, type: .debug, cloudFileUrl.path)
      try fileManager.startDownloadingUbiquitousItem(at: cloudFileUrl)
    } catch {
      os_log("[ensureFileLoaded] Cannot load file %{public}@: %{public}@", log: logger, type: .error, key, error.localizedDescription)
    }
    
    let startingTime = Date()
    os_log("[ensureFileLoaded] Waiting for file to download", log: logger, type: .debug)
    while (!fileManager.fileExists(atPath: fileUrl.path) && (Date().timeIntervalSince(startingTime) < 5)) { }
    
    if fileManager.fileExists(atPath: fileUrl.path) {
      os_log("[ensureFileLoaded] File successfully downloaded", log: logger, type: .debug)
    } else {
      os_log("[ensureFileLoaded] File download timed out", log: logger, type: .error)
    }

    return
  }
}
