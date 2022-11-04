//
//  QRView.swift
//  haqq
//
//  Created by Andrey Makarov on 04.11.2022.
//

import Foundation

@objc(RNQRViewManager)
class RNQRViewManager: RCTViewManager {
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return QRView()
  }
  
  @objc func updateFromManager(_ node: NSNumber, value: String) {
    DispatchQueue.main.async {
      let component = self.bridge.uiManager.view(
        forReactTag: node
      ) as! QRView
      component.update(newValue: value)
    }
  }
}

import UIKit
class QRView: UIView {
  @objc var value = "" {
    didSet {
      button.setTitle(String(describing: value), for: .normal)
    }
  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    self.addSubview(button)
  }
  
  required init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func layoutSubviews() {
    button.frame.size.height = self.bounds.width
  }
  
  lazy var button: UIButton = {
    let b = UIButton.init(type: UIButton.ButtonType.system)
    b.titleLabel?.font = UIFont.systemFont(ofSize: 50)
    b.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    b.backgroundColor = .darkGray
    return b
  }()
  
  @objc func update(newValue: String) {
    value = newValue
  }
}
