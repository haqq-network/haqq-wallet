//
//  EthUtils.m
//  haqq
//
//  Created by Andrey Makarov on 01.11.2022.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(RNEthUtils, NSObject)
  RCT_EXTERN_METHOD(generate: (RCTPromiseResolveBlock) resolve
                    rejecter: (RCTPromiseRejectBlock) reject)
@end
