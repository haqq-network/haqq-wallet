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
    return false
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
class QRView: UIImageView {
  var width: CGFloat = 0.0 {
    didSet {
      rerenderImage()
    }
  }
  
  @objc var value = "" {
    didSet {
      rerenderImage()
    }
  }
  
  var qrCodeImage: CIImage!
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    self.contentMode = .scaleAspectFit
  }
  
  init() {
      super.init(frame: CGRect.zero)
  }
  
  required init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func layoutSubviews() {
    print("self.bounds \(self.bounds)")
    width = self.bounds.width
  }
  
  @objc func update(newValue: String) {
    value = newValue
  }
  
  func rerenderImage() {
    if let qrImage = generateQrCode(value) {
      image = UIImage(ciImage: qrImage)
      
      if width > 0.0 {
        let logo = UIImage(named: "qr-logo")?.rounded(radius: 8.0)
        logo?.addToCenter(of: self, width: width * 0.302325581, height: width * 0.302325581)
      }
    }
  }
  
  func generateQrCode(_ content: String)  -> CIImage? {
      let data = content.data(using: String.Encoding.ascii, allowLossyConversion: false)
      let filter = CIFilter(name: "CIQRCodeGenerator")

      filter?.setValue(data, forKey: "inputMessage")
      filter?.setValue("H", forKey: "inputCorrectionLevel")

      if let qrCodeImage = (filter?.outputImage){
          return qrCodeImage
      }

      return nil
  }
}

extension UIImage {
    func addToCenter(of superView: UIView, width: CGFloat = 100, height: CGFloat = 100) {
        let overlayImageView = UIImageView(image: self)
        
      print("overlayImageView \(overlayImageView.bounds) \(overlayImageView.frame)")
      print("superView \(superView.frame)")

        overlayImageView.translatesAutoresizingMaskIntoConstraints = false
        overlayImageView.contentMode = .scaleAspectFit
        superView.addSubview(overlayImageView)
        
        let centerXConst = NSLayoutConstraint(item: overlayImageView, attribute: .centerX, relatedBy: .equal, toItem: superView, attribute: .centerX, multiplier: 1, constant: 0)
        let width = NSLayoutConstraint(item: overlayImageView, attribute: .width, relatedBy: .equal, toItem: nil, attribute: .notAnAttribute, multiplier: 1, constant: 100)
        let height = NSLayoutConstraint(item: overlayImageView, attribute: .height, relatedBy: .equal, toItem: nil, attribute: .notAnAttribute, multiplier: 1, constant: 100)
        let centerYConst = NSLayoutConstraint(item: overlayImageView, attribute: .centerY, relatedBy: .equal, toItem: superView, attribute: .centerY, multiplier: 1, constant: 0)
        
        NSLayoutConstraint.activate([width, height, centerXConst, centerYConst])
    }
}

extension UIImage {
    public func rounded(radius: CGFloat) -> UIImage {
        let rect = CGRect(origin: .zero, size: size)
        UIGraphicsBeginImageContextWithOptions(size, false, 0)
        UIBezierPath(roundedRect: rect, cornerRadius: radius).addClip()
        draw(in: rect)
        return UIGraphicsGetImageFromCurrentImageContext()!
    }
}
