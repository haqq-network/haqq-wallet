import UIKit
import React
import FirebaseCore

func clearKeychainIfNecessary() {
  // Checks whether or not this is the first time the app is run
  if UserDefaults.standard.bool(forKey: "HAS_RUN_BEFORE") == false {
    // Set the appropriate value so we don't clear next time the app is launched
    UserDefaults.standard.set(true, forKey: "HAS_RUN_BEFORE")

    let accounts = [
      "mnemonic_accounts",
      "mnemonic_saved",
      "hot_accoutns",
      "hot_saved",
      "sss_accounts",
      "sss_saved",
      "ledger_accounts",
      "ledger_saved"
    ]

    for account in accounts {
      let removeQuery: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: account,
        kSecReturnData as String: kCFBooleanTrue as Any
      ]

      let removeStatus = SecItemDelete(removeQuery as CFDictionary)
    }
  }
}

@UIApplicationMain
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    moduleName = getModuleName()
    initialProps = [:]
    clearKeychainIfNecessary();
    FirebaseApp.configure()
    let app = super.application(application, didFinishLaunchingWithOptions: launchOptions);
    RNSplashScreen.show();
    RCTI18nUtil().allowRTL(RCTI18nUtil().isRTLAllowed());
    return app;
  }

  override func sourceURL(for bridge: RCTBridge?) -> URL? {
    return bundleURL()
  }
  
  override func bundleURL() -> URL? {
    #if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackExtension: nil)
    #else
      return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }

  func getModuleName() -> String {
    if UIDevice.current.isJailBroken {
      return "jailbreak"
    } else {
      return "haqq"
    }
  }
  
  override func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
      return RCTLinkingManager.application(application, open: url, options: options)
  }

  func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([Any]?) -> Void) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
}
