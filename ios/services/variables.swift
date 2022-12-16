//
//  variables.swift
//  haqq
//
//  Created by Andrey Makarov on 15.12.2022.
//

import Foundation

let LIGHT_TEXT_BASE_1 = UIColor(red: 0.183, green: 0.183, blue: 0.183, alpha: 1)
let DARK_TEXT_BASE_1 = UIColor(red: 1, green: 1, blue: 1, alpha: 1)

let LIGHT_BG_1 = UIColor(red: 1, green: 1, blue: 1, alpha: 1)
let DARK_BG_1 = UIColor(red: 0.094, green: 0.11, blue: 0.102, alpha: 1)

public enum RNTheme: String, Codable {
  case light;
  case dark;
}
