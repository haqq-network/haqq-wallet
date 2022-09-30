//
//  Haptic.m
//  haqq
//
//  Created by Andrey Makarov on 30.09.2022.
//
#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(RNHaptic, NSObject)
  RCT_EXTERN_METHOD(vibrate: (NSString *) effect)
@end
