//
//  Encryption.m
//  haqq
//
//  Created by Andrey Makarov on 22.09.2022.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(RNEncryption, NSObject)
  RCT_EXTERN_METHOD(
                    resolvePromise: (NSString *) param
                    second: (NSString *) second
                    resolve: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject
  )

  RCT_EXTERN_METHOD(
                  encrypt: (NSString *) password
                  data: (NSString *) data
                  resolve: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject
  )

  RCT_EXTERN_METHOD(
                  decrypt: (NSString *) password
                  data: (NSString *) data
                  resolve: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject
  )
@end
