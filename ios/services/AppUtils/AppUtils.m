//
//  AppUtils.m
//  haqq
//
//  Created by Kira on 06.07.2023.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
@import UIKit;
@import ObjectiveC.runtime;

@interface UISystemNavigationAction : NSObject
@property(nonatomic, readonly, nonnull) NSArray<NSNumber*>* destinations;
  -(BOOL)sendResponseForDestination:(NSUInteger)destination;
@end

@interface RCT_EXTERN_MODULE(RNAppUtils, NSObject)
  RCT_EXPORT_METHOD(goBack)
  {
    Ivar sysNavIvar = class_getInstanceVariable(UIApplication.class, "_systemNavigationAction");
    UIApplication* app = UIApplication.sharedApplication;
    UISystemNavigationAction* action = object_getIvar(app, sysNavIvar);
    if (!action) {
        return;
    }
    NSUInteger destination = action.destinations.firstObject.unsignedIntegerValue;
    [action sendResponseForDestination:destination];
    return;
  }
@end

