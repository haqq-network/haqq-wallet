//
//  AppDelegate.swift
//  haqq
//
//  Created by Andrey Makarov on 21.06.2023.
//
import Foundation
import UIKit
import React

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
            "mpc_accounts",
            "mpc_saved",
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
    clearKeychainIfNecessary();

    FirebaseApp.configure()
    let app = super.application(application, didFinishLaunchingWithOptions: launchOptions);

    RNSplashScreen.show()

    return app;
  }

  @objc
  func concurrentRootEnabled() -> Bool {
      // Switch this bool to turn on and off the concurrent root
      return true
  }

  override func sourceURL(for bridge: RCTBridge!) -> URL! {
      #if DEBUG
      return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
      #else
      return Bundle.main.url(forResource: "main", withExtension: "jsBundle")
      #endif
  }

  override func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
      return RCTLinkingManager.application(application, open: url, options: options)
  }

  func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([Any]?) -> Void) -> Bool {
      return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }

  override func applicationDidEnterBackground(_ application: UIApplication) {
      let blurEffect = UIBlurEffect(style: .dark)
      let blurEffectView = UIVisualEffectView(effect: blurEffect)
      //always fill the view
      blurEffectView.frame = self.window?.bounds ?? CGRect.zero
      blurEffectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      blurEffectView.tag = 181099

      self.window?.addSubview(blurEffectView)
  }

  override func applicationDidBecomeActive(_ application: UIApplication) {
      self.window?.viewWithTag(181099)?.removeFromSuperview()
  }

  func getModuleName() -> String {
    if UIDevice.current.isJailBroken {
      return "jailbrake"
    } else {
      return "haqq"
    }
  }
}
