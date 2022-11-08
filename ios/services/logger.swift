//
//  logger.swift
//  haqq
//
//  Created by Andrey Makarov on 02.11.2022.
//

import Foundation

public func logger(_ input: String) -> Void {
  let df = DateFormatter()
  df.dateFormat = "y-MM-dd HH:mm:ss.SSSSSS"
  print("\(df.string(from: Date())) \(input)")
}
