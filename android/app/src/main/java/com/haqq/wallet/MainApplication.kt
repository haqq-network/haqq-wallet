package com.haqq.wallet

import android.app.Application
import android.os.Build
import com.facebook.react.*
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load;
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.haqq.wallet.haptic.HapticPackage
import com.haqq.wallet.cloud.CloudPackage
import com.haqq.wallet.version.VersionPackage
import com.haqq.wallet.MainApplication
import com.haqq.wallet.toast.ToastPackage
import android.webkit.WebView;
import androidx.annotation.RequiresApi
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.haqq.wallet.appnativeconfig.AppNativeConfigPackage
import com.haqq.wallet.apputils.AppUtilsPackage
import com.jakewharton.processphoenix.ProcessPhoenix

class MainApplication : Application(), ReactApplication {
  override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
    override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(HapticPackage())
              add(VersionPackage())
              add(ToastPackage())
              add(CloudPackage())
              add(AppUtilsPackage())
              add(AppNativeConfigPackage())
            }

    override fun getJSMainModuleName(): String = "index"

    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
    override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
    override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
  }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(this.applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    // To check if your application is inside the Phoenix process to skip initialization in onCreate:
    if (ProcessPhoenix.isPhoenixProcess(this)) {
      return;
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      WebView.setDataDirectorySuffix("haqqwebview")
    }

    if (BuildConfig.DEBUG) {
      WebView.setWebContentsDebuggingEnabled(true);
    }

    SoLoader.init(this,  /* native exopackage */false)

    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}
