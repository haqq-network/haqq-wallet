package com.haqq.wallet

import android.app.Application
import android.content.Context
import com.facebook.react.*
import com.facebook.react.config.ReactFeatureFlags
import com.haqq.wallet.haptic.HapticPackage
import com.haqq.wallet.cloud.CloudPackage
import com.haqq.wallet.version.VersionPackage
import com.haqq.wallet.ethutils.EthUtilsPackage
import com.haqq.wallet.newarchitecture.MainApplicationReactNativeHost
import com.facebook.soloader.SoLoader
import com.haqq.wallet.MainApplication
import com.haqq.wallet.toast.ToastPackage
import java.lang.reflect.InvocationTargetException
import android.webkit.WebView;
import com.haqq.wallet.appnativeconfig.AppNativeConfigPackage
import com.haqq.wallet.apputils.AppUtilsPackage

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
      packages.add(EthUtilsPackage())
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
  private val mNewArchitectureNativeHost: ReactNativeHost = MainApplicationReactNativeHost(this)
  override fun getReactNativeHost(): ReactNativeHost {
    return if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      mNewArchitectureNativeHost
    } else {
      mReactNativeHost
    }
  }

  override fun onCreate() {
    super.onCreate()
    // If you opted-in for the New Architecture, we enable the TurboModule system
    ReactFeatureFlags.useTurboModules = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED

    if (BuildConfig.DEBUG) {
			WebView.setWebContentsDebuggingEnabled(true);
		}

    SoLoader.init(this,  /* native exopackage */false)
    initializeFlipper(this, reactNativeHost.reactInstanceManager)
  }

  companion object {
    /**
     * Loads Flipper in React Native templates. Call this in the onCreate method with something like
     * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
     *
     * @param context
     * @param reactInstanceManager
     */
    private fun initializeFlipper(
      context: Context, reactInstanceManager: ReactInstanceManager
    ) {
      if (BuildConfig.DEBUG) {
        try {
          /*
We use reflection here to pick up the class that initializes Flipper,
since Flipper library is not available in release mode
*/
          val aClass = Class.forName("com.haqq.ReactNativeFlipper")
          aClass
            .getMethod(
              "initializeFlipper",
              Context::class.java,
              ReactInstanceManager::class.java
            )
            .invoke(null, context, reactInstanceManager)
        } catch (e: ClassNotFoundException) {
          e.printStackTrace()
        } catch (e: NoSuchMethodException) {
          e.printStackTrace()
        } catch (e: IllegalAccessException) {
          e.printStackTrace()
        } catch (e: InvocationTargetException) {
          e.printStackTrace()
        }
      }
    }
  }
}
