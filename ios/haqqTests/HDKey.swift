//
//  HDKey.swift
//  haqqTests
//
//  Created by Andrey Makarov on 01.11.2022.
//

import XCTest
@testable import haqq

final class HDKey: XCTestCase {

  override func setUpWithError() throws {
      // Put setup code here. This method is called before the invocation of each test method in the class.
  }

  override func tearDownWithError() throws {
      // Put teardown code here. This method is called after the invocation of each test method in the class.
  }

  func testInitFromData() throws {
    let privateKey: [UInt8] = [202, 51, 19, 72, 127, 218, 2, 90, 113, 246, 240, 49, 151, 129, 46, 243, 130, 238, 150, 1, 54, 189, 62, 190, 149, 119, 70, 185, 148, 165, 16, 64]
    let chainCode: [UInt8] = [196, 40, 137, 7, 223, 103, 100, 195, 22, 174, 58, 115, 199, 136, 141, 75, 184, 41, 74, 183, 105, 158, 253, 145, 175, 70, 234, 119, 80, 3, 188, 46]
    let key = haqq.HDKey(privateKey: privateKey, chainCode: chainCode)
    
    XCTAssertEqual(Data(key.publicKey).toHexString(), "0392937ffc2c26c527ec7d5cdb7a42b308016c63ebd7a610d3f61ae68d4ca38642")
  }
  
  func testInitFromSeed() throws {
    let seed = Array(Data(hex:"f6afca861c61fe47b15d74a24f9eb463c4ad7498ecb99e5d31b6ede7217396d62d437309f7fe08e40fe9303399b41a712e711c6a7ff8cd19516bcf0364bea430"))
    let key = try haqq.HDKey(seed: seed)
    
    XCTAssertEqual(Data(key.publicKey).toHexString(), "0392937ffc2c26c527ec7d5cdb7a42b308016c63ebd7a610d3f61ae68d4ca38642")
  }

  func testDeriveChild() throws {
    let privateKey: [UInt8] = [202, 51, 19, 72, 127, 218, 2, 90, 113, 246, 240, 49, 151, 129, 46, 243, 130, 238, 150, 1, 54, 189, 62, 190, 149, 119, 70, 185, 148, 165, 16, 64]
    let chainCode: [UInt8] = [196, 40, 137, 7, 223, 103, 100, 195, 22, 174, 58, 115, 199, 136, 141, 75, 184, 41, 74, 183, 105, 158, 253, 145, 175, 70, 234, 119, 80, 3, 188, 46]
    let key = haqq.HDKey(privateKey: privateKey, chainCode: chainCode)
    
    guard let new_key = key.deriveChild(segment: "44'") else {
      return XCTFail()
    }
    
    XCTAssertEqual(Data(new_key.publicKey).toHexString(), "0217490122e0afde9cfa59203efea305fc4023bd8142685033f968505de82924a8")
    XCTAssertEqual(Data(new_key.privateKey).toHexString(), "144719d3eb117e945c93b638d2267458832dd8bb0a96e01f83ff3e1df504fef9")
    XCTAssertEqual(Data(new_key.chainCode).toHexString(), "74ab9c3324fa735c835a8cbe2745f3b41c2f34659b8d6748d215f84eedb946bd")
  }
  
  func testDeriveChild2() throws {
    let privateKey: [UInt8] = [202, 51, 19, 72, 127, 218, 2, 90, 113, 246, 240, 49, 151, 129, 46, 243, 130, 238, 150, 1, 54, 189, 62, 190, 149, 119, 70, 185, 148, 165, 16, 64]
    let chainCode: [UInt8] = [196, 40, 137, 7, 223, 103, 100, 195, 22, 174, 58, 115, 199, 136, 141, 75, 184, 41, 74, 183, 105, 158, 253, 145, 175, 70, 234, 119, 80, 3, 188, 46]
    let key = haqq.HDKey(privateKey: privateKey, chainCode: chainCode)
    
    guard let new_key = key.deriveChild(segment: "44") else {
      return XCTFail()
    }
    
    XCTAssertEqual(Data(new_key.publicKey).toHexString(), "02553855bfc3b41be47d8c5eb32b4914d996be97370de74e793ec0b94020b01d24")
    XCTAssertEqual(Data(new_key.privateKey).toHexString(), "47c0c06a581933d3c727cd7be76ec67612463da85bc920b460c4a92d86165e16")
    XCTAssertEqual(Data(new_key.chainCode).toHexString(), "23ffd9a7983e7a1e580b12fdaa92d8ce755923668a017ab6d55d8833d2925058")
  }
  
  func testDerive() throws {
    let privateKey: [UInt8] = [202, 51, 19, 72, 127, 218, 2, 90, 113, 246, 240, 49, 151, 129, 46, 243, 130, 238, 150, 1, 54, 189, 62, 190, 149, 119, 70, 185, 148, 165, 16, 64]
    let chainCode: [UInt8] = [196, 40, 137, 7, 223, 103, 100, 195, 22, 174, 58, 115, 199, 136, 141, 75, 184, 41, 74, 183, 105, 158, 253, 145, 175, 70, 234, 119, 80, 3, 188, 46]
    let key = haqq.HDKey(privateKey: privateKey, chainCode: chainCode)
    
    guard let new_key = key.derive(path: "m/44'/60'/0'/0/0") else {
      return XCTFail()
    }
    
    XCTAssertEqual(Data(new_key.publicKey).toHexString(), "02fe389b960a6f40df9909acfede4641df434eb9d5e5db74e65827713456339a62")
    XCTAssertEqual(Data(new_key.privateKey).toHexString(), "c9b3168b5bc173fbd6d5a33943f0e2e045632dfce26120c58a8c8142ee76fc0f")
  }
  
  
  func testPath() throws {
    let privateKey: [UInt8] = [202, 51, 19, 72, 127, 218, 2, 90, 113, 246, 240, 49, 151, 129, 46, 243, 130, 238, 150, 1, 54, 189, 62, 190, 149, 119, 70, 185, 148, 165, 16, 64]
    let chainCode: [UInt8] = [196, 40, 137, 7, 223, 103, 100, 195, 22, 174, 58, 115, 199, 136, 141, 75, 184, 41, 74, 183, 105, 158, 253, 145, 175, 70, 234, 119, 80, 3, 188, 46]
    let key = haqq.HDKey(privateKey: privateKey, chainCode: chainCode)
    
    
    
  }
  

  func testPerformanceExample() throws {
    // This is an example of a performance test case.
    self.measure {
      let privateKey: [UInt8] = [202, 51, 19, 72, 127, 218, 2, 90, 113, 246, 240, 49, 151, 129, 46, 243, 130, 238, 150, 1, 54, 189, 62, 190, 149, 119, 70, 185, 148, 165, 16, 64]
      let chainCode: [UInt8] = [196, 40, 137, 7, 223, 103, 100, 195, 22, 174, 58, 115, 199, 136, 141, 75, 184, 41, 74, 183, 105, 158, 253, 145, 175, 70, 234, 119, 80, 3, 188, 46]
      let key = haqq.HDKey(privateKey: privateKey, chainCode: chainCode)
      
      guard let new_key = key.derive(path: "m/44'/60'/0'/0/0") else {
        return XCTFail()
      }
      
      XCTAssertEqual(Data(new_key.publicKey).toHexString(), "02fe389b960a6f40df9909acfede4641df434eb9d5e5db74e65827713456339a62")
      XCTAssertEqual(Data(new_key.privateKey).toHexString(), "c9b3168b5bc173fbd6d5a33943f0e2e045632dfce26120c58a8c8142ee76fc0f")
    }
  }

}
