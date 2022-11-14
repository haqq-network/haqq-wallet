//
//  ReactViewContrller.swift
//  haqq
//
//  Created by Andrey Makarov on 14.11.2022.
//

import Foundation
import React

@objc
public class ReactViewController: UIViewController {
    
    init(moduleName: String, bridge: RCTBridge) {
        super.init(nibName: nil, bundle: nil)
        view = RCTRootView(bridge: bridge,
                           moduleName: moduleName,
                           initialProperties: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
