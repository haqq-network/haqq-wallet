#import "AppDelegate.h"
#import <Firebase.h>
#import <RNSplashScreen.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <React/RCTAppSetupUtils.h>
#import <React/RCTLinkingManager.h>

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
  
   bool didFinish=[super application:application didFinishLaunchingWithOptions:launchOptions];
   [RNSplashScreen show];  // here
   return didFinish;
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feture is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  // Switch this bool to turn on and off the concurrent root
  return true;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}

- (void)applicationDidEnterBackground:(UIApplication *)application{
  overview = [[[NSBundle mainBundle] loadNibNamed:@"overview" owner:self options:nil] objectAtIndex:0];
  overview.frame = self.window.bounds;
  overview.tag = 181099;
  [self.window addSubview:overview];
}

- (void)applicationDidBecomeActive:(UIApplication *)application{
  [[self.window viewWithTag:181099] removeFromSuperview];
}

@end
