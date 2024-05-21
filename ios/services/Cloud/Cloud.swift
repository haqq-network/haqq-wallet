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
    ensureFileLoaded(key)
    do {
      let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
      
      let fileNames = try! self.fileManager.contentsOfDirectory(atPath: nestedFolderURL.path)
      
      for fileName in fileNames {
        print(fileName)
      }
      
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
    guard isCloudEnabled else {
      return
    }
    
    ensureFileLoaded(key)
    let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
    
    let fileUrl = nestedFolderURL.appendingPathComponent(key)
    do {
      if self.fileManager.fileExists(atPath: fileUrl.path) {
        try self.fileManager.removeItem(at: fileUrl)
      }
      
      try value.write(to: fileUrl, atomically: false, encoding: .utf8)
      resolve(true)
    }
    catch {
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
    let nestedFolderURL = DocumentsDirectory.iCloudDocumentsURL!
    let fileUrl = nestedFolderURL.appendingPathComponent(key)
    
    do {
      try fileManager.createDirectory(atPath: nestedFolderURL.path, withIntermediateDirectories: true);
    } catch {
      // Directory already exist, nothing to do here
    }
    if fileManager.fileExists(atPath: fileUrl.path) == true {
        return
    }
    
    let cloudFileUrl = nestedFolderURL.appendingPathComponent(".\(key).icloud")

    if fileManager.fileExists(atPath: cloudFileUrl.path) == false {
      return
    }
    
    do {
      try fileManager.startDownloadingUbiquitousItem(at: cloudFileUrl)
    } catch {
      logger("cant load file \(key)")
    }
    
    let startingTime = Date()
    while (!fileManager.fileExists(atPath: fileUrl.path) && (Date().timeIntervalSince(startingTime) < 5)) { }

    return
  }
}
