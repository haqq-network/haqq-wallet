//
//  Haptic.swift
//  haqq
//
//  Created by Andrey Makarov on 30.09.2022.
//

import Foundation

enum RNHapticEffect: String
{
  case selection
  case success
  case warning
  case error
}


@objc(RNHaptic)
class RNHaptic: NSObject {
  static let notification = {
    let generator = UINotificationFeedbackGenerator()
    generator.prepare();
    
    return generator;
  }()
  
  static let selection = {
    let generator = UISelectionFeedbackGenerator()
    generator.prepare();
    
    return generator;
  }()
  
  @objc
  static func requiresMainQueueSetup() -> Bool { return true }
  
  @objc
  func vibrate(_ effect: Optional<String>) -> Void {
    guard let effect = effect else {
      return
    }
    
    let effectValue = RNHapticEffect(rawValue: effect)
    
    switch effectValue {
    case .selection:
        selection()

    case .success:
      notification(.success)

    case .warning:
      notification(.warning)
      
    case .error:
      notification(.error)

    default:
        return
    }
    
  }
  
  func notification(_ notificationType: UINotificationFeedbackGenerator.FeedbackType) -> Void {
    DispatchQueue.main.async {
      RNHaptic.notification.notificationOccurred(notificationType)
      RNHaptic.notification.prepare()
    }
  }
  
  func selection() -> Void {
    DispatchQueue.main.async {
      RNHaptic.selection.selectionChanged()
      RNHaptic.selection.prepare()
    }
  }
}
