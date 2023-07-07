//
//  AppUtils.swift
//  haqq
//
//  Created by Kira on 06.07.2023.
//
import Foundation

@objc(RNAppUtils)
class RNAppUtils: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool { return true }
}
