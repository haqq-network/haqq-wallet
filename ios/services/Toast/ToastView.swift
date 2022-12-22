//
//  ToastView.swift
//  haqq
//
//  Created by Andrey Makarov on 15.12.2022.
//

import Foundation
import ToastViewSwift

public class CustomTextToastView : UIStackView {
  public init(_ title: String, theme: Theme.Theme = .light, subtitle: String? = nil) {
    super.init(frame: CGRect.zero)
    axis = .vertical
    alignment = .center
    distribution = .fillEqually
        
    let titleLabel = UILabel()
    titleLabel.text = title
    titleLabel.font = .systemFont(ofSize: 14, weight: .bold)
    titleLabel.textColor = theme == .light ? LIGHT_TEXT_BASE_1 : DARK_TEXT_BASE_1
    titleLabel.numberOfLines = 1
    addArrangedSubview(titleLabel)
    
    if let subtitle = subtitle {
      let subtitleLabel = UILabel()
      subtitleLabel.textColor = .systemGray
      subtitleLabel.text = subtitle
      subtitleLabel.font = .systemFont(ofSize: 12, weight: .bold)
      addArrangedSubview(subtitleLabel)
    }
  }
  
  required init(coder: NSCoder) {
      fatalError("init(coder:) has not been implemented")
  }
}

class CustomToastView : UIView, ToastView {
  private let minHeight: CGFloat = 50
  private let minWidth: CGFloat = 90

  private let theme: Theme.Theme
  
  private let child: UIView

  private weak var toast: Toast?
  
  public init(
    child: UIView,
    minHeight: CGFloat = 50,
    minWidth: CGFloat = 90,
    theme: Theme.Theme = .light
  ) {
    self.theme = theme
    self.child = child
    
    super.init(frame: .zero)
    
    addSubview(child)
  }
  
  public func createView(for toast: Toast) {
    self.toast = toast
    guard let superview = superview else { return }
    translatesAutoresizingMaskIntoConstraints = false
    
    NSLayoutConstraint.activate([
      heightAnchor.constraint(greaterThanOrEqualToConstant: minHeight),
      widthAnchor.constraint(greaterThanOrEqualToConstant: minWidth),
      leadingAnchor.constraint(greaterThanOrEqualTo: superview.leadingAnchor, constant: 10),
      trailingAnchor.constraint(lessThanOrEqualTo: superview.trailingAnchor, constant: -10),
      centerXAnchor.constraint(equalTo: superview.centerXAnchor)
    ])
    
    topAnchor.constraint(equalTo: superview.layoutMarginsGuide.topAnchor, constant: 0).isActive = true
    
    addSubviewConstraints()
    DispatchQueue.main.async {
      self.style()
    }
  }
  
  public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    UIView.animate(withDuration: 0.5) {
      self.style()
    }
  }
  
  private func style() {
    layoutIfNeeded()
    clipsToBounds = true
    layer.zPosition = 999
    layer.cornerRadius = frame.height / 2
    
    backgroundColor = theme == .light ? LIGHT_BG_1 : DARK_BG_1
      
    addShadow()
  }
  
  private func addSubviewConstraints() {
    child.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      child.topAnchor.constraint(equalTo: topAnchor, constant: 10),
      child.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -10),
      child.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 25),
      child.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -25)
    ])
  }
  
  private func addShadow() {
    layer.masksToBounds = false
    layer.shadowOffset = CGSize(width: 0, height: 6)
    layer.shadowColor = UIColor(red: 0.098, green: 0.102, blue: 0.11, alpha: 0.06).cgColor
    layer.shadowOpacity = 1
    layer.shadowRadius = 24
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
}
