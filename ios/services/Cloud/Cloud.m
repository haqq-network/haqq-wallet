//
//  Cloud.m
//  haqq
//
//  Created by Andrey Makarov on 10.03.2023.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(RNCloud, NSObject)
RCT_EXTERN_METHOD(
                  hasItem: (NSString *) key
                  resolve: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject
                  )
RCT_EXTERN_METHOD(
                  getItem: (NSString *) key
                  resolve: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject
                  )
RCT_EXTERN_METHOD(
                  removeItem: (NSString *) key
                  resolve: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject
                  )
RCT_EXTERN_METHOD(
                  setItem: (NSString *) key
                  value: (NSString *) value
                  resolve: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject
                  )
@end
