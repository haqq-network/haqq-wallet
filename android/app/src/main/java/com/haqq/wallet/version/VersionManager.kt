package com.haqq.wallet.version

import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

class VersionManager (reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNVersion"

  private var appVersion: String = "unknown"
  private var buildNumber: String = "unknown"

  init {
    try {
      val pInfo: PackageInfo =
        reactContext.packageManager.getPackageInfo(reactContext.packageName, 0)
      this.appVersion = pInfo.versionName
      this.buildNumber = pInfo.versionCode.toString()

    } catch (e: PackageManager.NameNotFoundException) {
      e.printStackTrace()
    }
  }

  override fun getConstants(): MutableMap<String, Any> {
    val constants = mutableMapOf<String, Any>()
    constants["appVersion"] = this.appVersion
    constants["buildNumber"] = this.buildNumber
    return constants
  }
}
