//
//  EthUtils.m
//  haqq
//
//  Created by Andrey Makarov on 01.11.2022.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(RNEthUtils, NSObject)
  RCT_EXTERN_METHOD(
                    generateMnemonic: (NSNumber *) strength
                    resolve: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject
                    )

  RCT_EXTERN_METHOD(
                    restoreFromPrivateKey: (NSString *) privateKey
                    resolve: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject
                    )

  RCT_EXTERN_METHOD(
                    restoreFromMnemonic: (NSString *) mnemonicPhrase
                    path: (NSString *) path
                    resolve: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject
                    )
  RCT_EXTERN_METHOD(
                  sign: (NSString *) privateKey
                  message: (NSString *) message
                  resolve: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject
                  )
RCT_EXTERN_METHOD(
                sign2: (NSString *) privateKey
                message: (NSString *) message
                resolve: (RCTPromiseResolveBlock) resolve
                rejecter: (RCTPromiseRejectBlock) reject
                )
@end
