//
//  Toast.m
//  haqq
//
//  Created by Andrey Makarov on 15.12.2022.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(RNToast, NSObject)
  RCT_EXTERN_METHOD(message: (NSString *) message theme: (NSString *) theme)
@end
