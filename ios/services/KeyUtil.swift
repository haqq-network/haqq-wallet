//
//  secp256k1_wrapper.swift
//  haqq
//
//  Created by Andrey Makarov on 30.01.2023.
//

import Foundation
import secp256k1Wrapper

public enum KeyUtilError: Error {
  case invalidContext;
  case signatureFailure;
  case invalidLength;
}

public class KeyUtil {
  public static func sign(message: [UInt8], privateKey: [UInt8]) throws -> Data {
    var hash = message
    var pk = privateKey
    guard hash.count == 32 else {
        throw KeyUtilError.invalidLength
    }
    
    guard let ctx = secp256k1_context_create(UInt32(SECP256K1_CONTEXT_SIGN | SECP256K1_CONTEXT_VERIFY)) else {
      logger("Failed to sign message: invalid context.")
      throw KeyUtilError.invalidContext
    }

    defer {
      secp256k1_context_destroy(ctx)
    }

    let signaturePtr = UnsafeMutablePointer<secp256k1_ecdsa_recoverable_signature>.allocate(capacity: 1)
    defer {
      signaturePtr.deallocate()
    }

    guard secp256k1_ecdsa_sign_recoverable(ctx, signaturePtr, hash, pk, nil, nil) == 1 else {
      logger("Failed to sign message: recoverable ECDSA signature creation failed.")
      throw KeyUtilError.signatureFailure
    }

    let outputPtr = UnsafeMutablePointer<UInt8>.allocate(capacity: 64)
    defer {
      outputPtr.deallocate()
    }
    var recid: Int32 = 0
    secp256k1_ecdsa_recoverable_signature_serialize_compact(ctx, outputPtr, &recid, signaturePtr)

    let outputWithRecidPtr = UnsafeMutablePointer<UInt8>.allocate(capacity: 65)
    defer {
      outputWithRecidPtr.deallocate()
    }
    outputWithRecidPtr.assign(from: outputPtr, count: 64)
    outputWithRecidPtr.advanced(by: 64).pointee = UInt8(recid)

    let signature = Data(bytes: outputWithRecidPtr, count: 65)

    return signature
  }

}

