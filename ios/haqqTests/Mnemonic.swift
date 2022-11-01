//
//  Mnemonic.swift
//  haqqTests
//
//  Created by Andrey Makarov on 01.11.2022.
//

import XCTest
@testable import haqq

final class Mnemonic: XCTestCase {

  override func setUpWithError() throws {
      // Put setup code here. This method is called before the invocation of each test method in the class.
  }

  override func tearDownWithError() throws {
      // Put teardown code here. This method is called after the invocation of each test method in the class.
  }

  func testGenerateEmptyEntropy() throws {
    let s = haqq.Mnemonic.generateEntropy()
    
    XCTAssertEqual(s.count, 16)
  }
  
  func testGenerateSizedEntropy() throws {
    let s = haqq.Mnemonic.generateEntropy(strength: 24)
    
    XCTAssertEqual(s.count, 24)
  }
  
  func testMnemonicInitFromEntropy() throws {
    let s = haqq.Mnemonic.generateEntropy()

    let mnemonic = haqq.Mnemonic(bytes: s)
    
    XCTAssertEqual(mnemonic.isValid, true)
  }
  
  func testMnemonicInitFromBytes() throws {
    let bytes: [UInt8] = [99, 217, 244, 233, 222, 163, 139, 170, 225, 251, 157, 138, 154, 175, 134, 155]
    let mnemonic = haqq.Mnemonic(bytes: bytes)
    XCTAssertEqual(mnemonic.mnemonic.joined(separator: " "), "glow soul denial run december step margin inhale melody step ticket daughter")
    XCTAssertEqual(mnemonic.isValid, true)
    XCTAssertEqual(Data(mnemonic.seed).toHexString(), "f6afca861c61fe47b15d74a24f9eb463c4ad7498ecb99e5d31b6ede7217396d62d437309f7fe08e40fe9303399b41a712e711c6a7ff8cd19516bcf0364bea430")
  }
  
  func testMnemonicInitFromString() throws {
    let phrase = "latin silly employ myth crime crystal outer initial payment surprise ancient wisdom"
    let mnemonic = haqq.Mnemonic(phrase: phrase)
    
    XCTAssertEqual(mnemonic.isValid, true)
  }
  
  func testMnemonicInitFromStringArray() throws {
    let phrase = ["latin", "silly", "employ", "myth", "crime", "crystal", "outer", "initial", "payment", "surprise", "ancient", "wisdom"]
    let mnemonic = haqq.Mnemonic(words: phrase)
    
    XCTAssertEqual(mnemonic.isValid, true)
  }
  
  func testPerformanceExample() throws {
    // This is an example of a performance test case.
    self.measure {
      let mnemonic = haqq.Mnemonic(bytes: haqq.Mnemonic.generateEntropy(strength: 16))
      
      XCTAssertEqual(mnemonic.isValid, true)
    }
  }
}
