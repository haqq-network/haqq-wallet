//
//  Data+hexEncodedString.swift
//  haqq
//
//  Created by Andrey Makarov on 01.11.2022.
//

import Foundation

extension Data {
  func hexEncodedString() -> String {
    return map { String(format: "%02hhx", $0) }.joined()
  }
}
