//
//  AppDelegate.swift
//  haqq
//
//  Created by Andrey Makarov on 21.06.2023.
//
import Foundation
import UIKit
import React
import FirebaseCore
import AVFoundation

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

let OVERVIEW_TAG = 10000;
let OVERVIEW_FADE_DURATION = 0.5;

@UIApplicationMain
class AppDelegate: RCTAppDelegate {
  var overview: RCTRootView!;
  
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = getModuleName()
    clearKeychainIfNecessary();
    FirebaseApp.configure()
    let app = super.application(application, didFinishLaunchingWithOptions: launchOptions);
    initOverview();
    startObservingAppState();
    RNSplashScreen.show();
    return app;
  }
  
  // call after `super.application`
  func initOverview(){
    overview = RCTRootView.init(frame: self.window.frame, bridge: self.bridge, moduleName: "overview", initialProperties: self.initialProps);
    overview.tag = OVERVIEW_TAG;
    overview.alpha = 0;
  }
  
  private func startObservingAppState() {
    NotificationCenter.default.addObserver(self, selector: #selector(onAppBackground), name: UIApplication.willResignActiveNotification, object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(onAppActive), name: UIApplication.didBecomeActiveNotification, object: nil)
  }
  
  private func stopObservingAppState() {
    NotificationCenter.default.removeObserver(self)
  }
  
  @objc private func onAppBackground(notification: NSNotification) {
    print("🟠 onAppBackground: \(notification)")
      self.window?.addSubview(overview)
      UIView.animate(withDuration: OVERVIEW_FADE_DURATION, animations: {
          self.overview.alpha = 1
      })
  }

  @objc private func onAppActive(notification: NSNotification) {
      print("🟣 onAppActive: \(notification)")
      UIView.animate(withDuration: OVERVIEW_FADE_DURATION, animations: {
          self.overview.alpha = 0
      }) { _ in
          self.overview.removeFromSuperview()
      }
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
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
  
  override func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return RCTLinkingManager.application(application, open: url, options: options)
  }
  
  func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([Any]?) -> Void) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
  
  func getModuleName() -> String {
    if UIDevice.current.isJailBroken {
      return "jailbreak"
    } else {
      return "haqq"
    }
  }
}
