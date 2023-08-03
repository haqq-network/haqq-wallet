//
//  BooleanConfig.swift
//  haqq
//
//  Created by Kira on 03.08.2023.
//
import Foundation

enum BooleanConfigKey: String {
    case systemDialogEnabled
}

class BooleanConfig {
    static let shared = BooleanConfig()
    
    var storage: [BooleanConfigKey: Bool] = [:]
    
    private init() {
        storage[.systemDialogEnabled] = false
    }
}
