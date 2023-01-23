//
//  Data_bytes.swift
//  haqq
//
//  Created by Andrey Makarov on 23.01.2023.
//

import Foundation

extension Data {
    var bytes: [UInt8] {
        var byteArray = [UInt8](repeating: 0, count: self.count)
        self.copyBytes(to: &byteArray, count: self.count)
        return byteArray
    }
}
