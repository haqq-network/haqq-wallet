//
//  Toast.swift
//  haqq
//
//  Created by Andrey Makarov on 15.12.2022.
//

import Foundation
import ToastViewSwift

@objc(RNToast)
class RNToast: NSObject {
  static var cache: [Toast] = [];
  
  @objc
  static func requiresMainQueueSetup() -> Bool { return true }
  
  @objc
  func message(_ message: Optional<String>, theme: Optional<String>) -> Void {
    guard let message = message else {
      return
    }
    let theme = Theme.Theme(rawValue: theme ?? "light") ?? .light

    DispatchQueue.main.async {
      let view = CustomToastView(child: CustomTextToastView(message, theme: theme), theme: theme)
      let toast = Toast.custom(view: view, config: ToastConfiguration.init(displayTime:2))
      toast.show()
      RNToast.cache.append(toast)
    }

    if RNToast.cache.count > 3 {
      let first = RNToast.cache.removeFirst();
      DispatchQueue.main.async {
        first.close()
      }
    }
  }
}
