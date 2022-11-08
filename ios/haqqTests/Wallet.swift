//
//  Wallet.swift
//  haqqTests
//
//  Created by Andrey Makarov on 02.11.2022.
//

import XCTest
@testable import haqq

final class Wallet: XCTestCase {

  override func setUpWithError() throws {
      // Put setup code here. This method is called before the invocation of each test method in the class.
  }

  override func tearDownWithError() throws {
      // Put teardown code here. This method is called after the invocation of each test method in the class.
  }

  func testCreateWalletFromPrivateKeyFromBytes() throws {
    let privateKey: [UInt8] = [201, 179, 22, 139, 91, 193, 115, 251, 214, 213, 163, 57, 67, 240, 226, 224, 69, 99, 45, 252, 226, 97, 32, 197, 138, 140, 129, 66, 238, 118, 252, 15]
    
    let wallet = haqq.Wallet(privateKey: privateKey)
    
    XCTAssertEqual(Data(wallet.publicKey).toHexString(), "02fe389b960a6f40df9909acfede4641df434eb9d5e5db74e65827713456339a62")
    XCTAssertEqual(Data(wallet.address).toHexString(), "8f0d82c68f6b28b4f288c4333215797d0afb420c")
  }
  
  func testCreateWalletFromPrivateKeyFromString() throws {
    let wallet = haqq.Wallet(privateKey: "c9b3168b5bc173fbd6d5a33943f0e2e045632dfce26120c58a8c8142ee76fc0f")
    
    XCTAssertEqual(Data(wallet.publicKey).toHexString(), "02fe389b960a6f40df9909acfede4641df434eb9d5e5db74e65827713456339a62")
    XCTAssertEqual(Data(wallet.address).toHexString(), "8f0d82c68f6b28b4f288c4333215797d0afb420c")
  }

  func testPerformanceExample() throws {
      // This is an example of a performance test case.
    self.measure {
      let privateKey: [UInt8] = [201, 179, 22, 139, 91, 193, 115, 251, 214, 213, 163, 57, 67, 240, 226, 224, 69, 99, 45, 252, 226, 97, 32, 197, 138, 140, 129, 66, 238, 118, 252, 15]
      
      let wallet = haqq.Wallet(privateKey: privateKey)
      
      XCTAssertEqual(Data(wallet.publicKey).toHexString(), "02fe389b960a6f40df9909acfede4641df434eb9d5e5db74e65827713456339a62")
      XCTAssertEqual(Data(wallet.address).toHexString(), "8f0d82c68f6b28b4f288c4333215797d0afb420c")
    }
  }

}
