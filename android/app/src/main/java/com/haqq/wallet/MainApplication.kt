package com.haqq.wallet

import android.app.Application
import android.content.Context
import android.os.Build
import com.facebook.react.*
import com.facebook.react.config.ReactFeatureFlags
import com.haqq.wallet.haptic.HapticPackage
import com.haqq.wallet.cloud.CloudPackage
import com.haqq.wallet.version.VersionPackage
import com.facebook.soloader.SoLoader
import com.haqq.wallet.toast.ToastPackage
import com.jakewharton.processphoenix.ProcessPhoenix
import android.webkit.WebView
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.haqq.wallet.appnativeconfig.AppNativeConfigPackage
import com.haqq.wallet.apputils.AppUtilsPackage
import java.lang.reflect.InvocationTargetException

class MainApplication : Application(), ReactApplication {
    private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override fun getPackages(): List<ReactPackage> {
            val packages: MutableList<ReactPackage> = PackageList(this@MainApplication).packages
            packages.apply {
                add(HapticPackage())
                add(VersionPackage())
                add(ToastPackage())
                add(CloudPackage())
                add(AppUtilsPackage())
                add(AppNativeConfigPackage())
            }
            return packages
        }

        override fun getJSMainModuleName(): String = "index"
    }

    override val reactNativeHost: ReactNativeHost
        get() = mReactNativeHost

    override fun onCreate() {
        super.onCreate()
        if (ProcessPhoenix.isPhoenixProcess(this)) {
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WebView.setDataDirectorySuffix("haqqwebview")
        }

        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        SoLoader.init(this, /* native exopackage */false)
    }
}