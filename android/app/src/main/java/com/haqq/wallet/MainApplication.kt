package com.haqq.wallet

import android.app.Application
import android.os.Build
import com.facebook.react.*
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost
import com.haqq.wallet.haptic.HapticPackage
import com.haqq.wallet.cloud.CloudPackage
import com.haqq.wallet.version.VersionPackage
import com.facebook.soloader.SoLoader
import com.haqq.wallet.MainApplication
import com.haqq.wallet.toast.ToastPackage
import android.webkit.WebView;
import androidx.annotation.RequiresApi
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.haqq.wallet.appnativeconfig.AppNativeConfigPackage
import com.haqq.wallet.apputils.AppUtilsPackage
import com.jakewharton.processphoenix.ProcessPhoenix

class MainApplication : Application(), ReactApplication {
  private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
    override fun getUseDeveloperSupport(): Boolean {
      return BuildConfig.DEBUG
    }

    override fun getPackages(): List<ReactPackage> {
      val packages: MutableList<ReactPackage> = PackageList(this).packages
      // Packages that cannot be autolinked yet can be added manually here, for example:
      // packages.add(new MyReactNativePackage());
      packages.add(HapticPackage())
      packages.add(VersionPackage())
      packages.add(ToastPackage())
      packages.add(CloudPackage())
      packages.add(AppUtilsPackage())
      packages.add(AppNativeConfigPackage())

      return packages
    }

    override fun getJSMainModuleName(): String {
      return "index"
    }
  }
  
  override fun getReactNativeHost(): ReactNativeHost {
    return mReactNativeHost;
  }

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
      DefaultNewArchitectureEntryPoint.load();
    }
  }
}
