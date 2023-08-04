//
//  AppNativeConfig.m
//  haqq
//
//  Created by Kira on 03.08.2023.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AppNativeConfig, NSObject)
RCT_EXTERN_METHOD(setBoolean:(BOOL)value forKey:(NSString *)key resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)
RCT_EXTERN_METHOD(getBoolean:(NSString *)key resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)
@end
