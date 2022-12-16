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
  
  @objc
  static func requiresMainQueueSetup() -> Bool { return false }
  
  @objc
  func message(_ message: Optional<String>, theme: Optional<String>) -> Void {
    guard let message = message else {
      return
    }
    
    let theme = Theme.Theme(rawValue: theme ?? "light") ?? .light
    
    let view = CustomToastView(child: CustomTextToastView(message, theme: theme), theme: theme)
    let toast = Toast.custom(view: view, config: ToastConfiguration.init(displayTime:2))
    
    DispatchQueue.main.async {
      toast.show()
    }
  }
}
