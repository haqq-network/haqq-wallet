#import "AppDelegate.h"
#import <Firebase.h>
#import <RNSplashScreen.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <React/RCTAppSetupUtils.h>
#import <React/RCTLinkingManager.h>
#import <RNCustomAuthSdk/RNTorus.h>

static void ClearKeychainIfNecessary() {
    // Checks wether or not this is the first time the app is run
    if ([[NSUserDefaults standardUserDefaults] boolForKey:@"HAS_RUN_BEFORE"] == NO) {
        // Set the appropriate value so we don't clear next time the app is launched
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"HAS_RUN_BEFORE"];

      NSArray *accounts = @[
        @"mnemonic_accounts",
        @"mnemonic_saved",
        @"hot_accoutns",
        @"hot_saved",
        @"mpc_accounts",
        @"mpc_saved",
        @"ledger_accounts",
        @"ledger_saved",
      ];
      
      for (id account in accounts) {
        NSDictionary* removeQuery = @{
            (__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword,
            (__bridge id)kSecAttrAccount : account,
            (__bridge id)kSecReturnData : (__bridge id)kCFBooleanTrue
        };
        
        OSStatus removeStatus = SecItemDelete((__bridge CFDictionaryRef)removeQuery);
      }
    }
}

@implementation AppDelegate

RCTRootView* overview = nil;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"haqq";
  self.initialProps = @{};

  ClearKeychainIfNecessary();
  [FIRApp configure];
  [RNSplashScreen show];
  
  overview = [[[NSBundle mainBundle] loadNibNamed:@"overview" owner:self options:nil] objectAtIndex:0];
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)concurrentRootEnabled
{
  return true;
}

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  if ([self.authorizationFlowManagerDelegate resumeExternalUserAgentFlowWithURL:url]) {
    return YES;
  }
  
  NSString *myString = url.absoluteString;
  
  NSLog(@"String to handle : %@ ", myString);
  if (@available(iOS 13.0, *)) {
    [RNCustomAuthSdk handle:myString];
  } else {
    // Fallback on earlier versions
  }
  
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
   if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
     if (self.authorizationFlowManagerDelegate) {
       BOOL resumableAuth = [self.authorizationFlowManagerDelegate resumeExternalUserAgentFlowWithURL:userActivity.webpageURL];
       if (resumableAuth) {
         return YES;
       }
     }
   }
  
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}

- (void)applicationDidEnterBackground:(UIApplication *)application{
  overview.frame = self.window.bounds;
  overview.tag = 181099;
  [self.window addSubview:overview];
}

- (void)applicationDidBecomeActive:(UIApplication *)application{
  [[self.window viewWithTag:181099] removeFromSuperview];
}

@end
