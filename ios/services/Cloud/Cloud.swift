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

  var isCloudEnabled: Bool {
      if DocumentsDirectory.iCloudDocumentsURL != nil {
        return true
      } else {
        return false
      }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool { 
    return false 
  }

  @objc
  public func constantsToExport() -> [AnyHashable : Any]! {
    return ["isSupported": isSupported, "isEnabled": isCloudEnabled]
  }

  @objc
  public func hasItem(_ key: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    ensureFileLoaded(key)
    do {
      let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
      
      let fileNames = try! self.fileManager.contentsOfDirectory(atPath: nestedFolderURL.path)
      
      let fileUrl = nestedFolderURL.appendingPathComponent(key)
      let exists = self.fileManager.fileExists(atPath: fileUrl.path)
      resolve(exists)
    }
    catch {
      reject("0", "hasItem \(error)", nil)
    }
  }

  @objc
  public func getItem(_ key: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
      ensureFileLoaded(key)
      do {
        let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
        
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
    print("[javascript][RNCloud::setItem] Starting setItem with key: \(key), value length: \(value.count)")
    
    guard isCloudEnabled else {
      print("[javascript][RNCloud::setItem] Cloud is not enabled, rejecting")
      reject("0", "[RNCloud::setItem] Cloud is not enabled", nil)
      return
    }
    
    print("[javascript][RNCloud::setItem] Cloud is enabled, proceeding")
    print("[javascript][RNCloud::setItem] Calling ensureFileLoaded for key: \(key)")
    ensureFileLoaded(key)
    
    print("[javascript][RNCloud::setItem] Getting iCloud documents URL")
    let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
    print("[javascript][RNCloud::setItem] iCloud documents URL: \(nestedFolderURL.path)")
    
    let fileUrl = nestedFolderURL.appendingPathComponent(key)
    print("[javascript][RNCloud::setItem] Target file URL: \(fileUrl.path)")
    
    do {
      if self.fileManager.fileExists(atPath: fileUrl.path) {
        print("[javascript][RNCloud::setItem] Existing file found at path, removing")
        try self.fileManager.removeItem(at: fileUrl)
        print("[javascript][RNCloud::setItem] Successfully removed existing file")
      } else {
        print("[javascript][RNCloud::setItem] No existing file found at path")
      }
      
      print("[javascript][RNCloud::setItem] Writing new value to file")
      try value.write(to: fileUrl, atomically: false, encoding: .utf8)
      print("[javascript][RNCloud::setItem] Successfully wrote value to file")
      
      print("[javascript][RNCloud::setItem] Operation completed successfully")
      resolve(true)
    }
    catch {
      print("[javascript][RNCloud::setItem] Error occurred: \(error.localizedDescription)")
      print("[javascript][RNCloud::setItem] Error domain: \((error as NSError).domain)")
      print("[javascript][RNCloud::setItem] Error code: \((error as NSError).code)")
      reject("0", "setItem \(error)", nil)
    }
  }

  @objc
  public func removeItem(_ key: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    do {
      ensureFileLoaded(key)

      let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
      let fileUrl = nestedFolderURL.appendingPathComponent(key)
      if self.fileManager.fileExists(atPath: fileUrl.path) {
        try self.fileManager.removeItem(at: fileUrl)
      }
      resolve(true)
    }
    catch {
      reject("0", "removeItem \(error)", nil)
    }
  }
  
  func ensureFileLoaded(_ key: String) {
    print("[javascript][RNCloud::ensureFileLoaded] Starting with key: \(key)")
    
    let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
    print("[javascript][RNCloud::ensureFileLoaded] iCloud documents URL: \(nestedFolderURL.path)")
    
    let fileUrl = nestedFolderURL.appendingPathComponent(key)
    print("[javascript][RNCloud::ensureFileLoaded] Target file URL: \(fileUrl.path)")
    
    do {
      print("[javascript][RNCloud::ensureFileLoaded] Attempting to create directory at: \(nestedFolderURL.path)")
      try fileManager.createDirectory(atPath: nestedFolderURL.path, withIntermediateDirectories: true)
      print("[javascript][RNCloud::ensureFileLoaded] Successfully created directory")
    } catch let error {
      print("[javascript][RNCloud::ensureFileLoaded] Error creating directory: \(error.localizedDescription)")
      print("[javascript][RNCloud::ensureFileLoaded] Error domain: \((error as NSError).domain)")
      print("[javascript][RNCloud::ensureFileLoaded] Error code: \((error as NSError).code)")
    }
    
    print("[javascript][RNCloud::ensureFileLoaded] Checking if file exists at: \(fileUrl.path)")
    if fileManager.fileExists(atPath: fileUrl.path) == true {
      print("[javascript][RNCloud::ensureFileLoaded] File already exists, returning")
      return
    }
    print("[javascript][RNCloud::ensureFileLoaded] File does not exist locally")
    
    let cloudFileUrl = nestedFolderURL.appendingPathComponent(".\(key).icloud")
    print("[javascript][RNCloud::ensureFileLoaded] Checking for iCloud file at: \(cloudFileUrl.path)")

    if fileManager.fileExists(atPath: cloudFileUrl.path) == false {
      print("[javascript][RNCloud::ensureFileLoaded] iCloud file does not exist, returning")
      return
    }
    print("[javascript][RNCloud::ensureFileLoaded] Found iCloud file")
    
    do {
      print("[javascript][RNCloud::ensureFileLoaded] Starting download of ubiquitous item from: \(cloudFileUrl.path)")
      try fileManager.startDownloadingUbiquitousItem(at: cloudFileUrl)
      print("[javascript][RNCloud::ensureFileLoaded] Successfully initiated download")
    } catch let error {
      print("[javascript][RNCloud::ensureFileLoaded] Error starting download: \(error.localizedDescription)")
      print("[javascript][RNCloud::ensureFileLoaded] Error domain: \((error as NSError).domain)")
      print("[javascript][RNCloud::ensureFileLoaded] Error code: \((error as NSError).code)")
    }
    
    let startingTime = Date()
    print("[javascript][RNCloud::ensureFileLoaded] Starting wait loop at: \(startingTime)")
    
    while (!fileManager.fileExists(atPath: fileUrl.path) && (Date().timeIntervalSince(startingTime) < 5)) {
      print("[javascript][RNCloud::ensureFileLoaded] Waiting for file to appear at: \(fileUrl.path)")
      print("[javascript][RNCloud::ensureFileLoaded] Time elapsed: \(Date().timeIntervalSince(startingTime)) seconds")
    }
    
    print("[javascript][RNCloud::ensureFileLoaded] Finished waiting. File exists: \(fileManager.fileExists(atPath: fileUrl.path))")
    print("[javascript][RNCloud::ensureFileLoaded] Total time taken: \(Date().timeIntervalSince(startingTime)) seconds")
    return
  }
}
