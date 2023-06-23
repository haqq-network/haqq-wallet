package com.haqq.wallet.version

import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.Build
import android.webkit.WebSettings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.google.android.gms.ads.identifier.AdvertisingIdClient


class VersionManager(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNVersion"

  private var appVersion: String = "unknown"
  private var buildNumber: String = "unknown"
  private var isTrackingEnabled: Boolean = false
  private var adId: String = "unknown"

  init {
    try {
      val pInfo: PackageInfo =
        reactContext.packageManager.getPackageInfo(reactContext.packageName, 0)
      this.appVersion = pInfo.versionName
      this.buildNumber = pInfo.versionCode.toString()

      val adInfo: AdvertisingIdClient.Info = AdvertisingIdClient.getAdvertisingIdInfo(reactContext)

      if (adInfo.id != null) {
        this.adId = adInfo.id!!;
      }
      this.isTrackingEnabled = adInfo.isLimitAdTrackingEnabled

    } catch (e: PackageManager.NameNotFoundException) {
      e.printStackTrace()
    }
  }

  override fun getConstants(): MutableMap<String, Any> {
    val constants = mutableMapOf<String, Any>()
    val packageName = reactApplicationContext.packageName
    val shortPackageName: String = packageName.substring(packageName.lastIndexOf(".") + 1)


    constants["appVersion"] = this.appVersion
    constants["buildNumber"] = this.buildNumber
    constants["adId"] = this.adId
    constants["isTrackingEnabled"] = this.isTrackingEnabled
    constants["userAgent"] = shortPackageName + '/' + this.appVersion + '.' + this.buildNumber + ' ' + this.getUserAgent();
    return constants
  }

  protected fun getUserAgent(): String? {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
        WebSettings.getDefaultUserAgent(reactApplicationContext)
      } else {
        System.getProperty("http.agent")
      }
    } catch (e: RuntimeException) {
      System.getProperty("http.agent")
    }
  }

}
