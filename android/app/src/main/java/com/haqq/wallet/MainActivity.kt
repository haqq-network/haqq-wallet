package com.haqq.wallet

import android.os.Bundle
import android.view.WindowManager
import androidx.fragment.app.Fragment
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactFragment
import com.facebook.react.ReactRootView
import com.haqq.wallet.MainActivity.MainActivityDelegate
import com.scottyab.rootbeer.RootBeer
import org.devio.rn.splashscreen.SplashScreen

class MainActivity : ReactActivity() {
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String? {
    val rootBeer = RootBeer(this);
    if (rootBeer.isRooted) {
      return "jailbreak"
    } else {
      return "haqq"
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreen.show(this, true)
    super.onCreate(null)
  }

  override fun onPause() {
    window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
    super.onPause()

  }

  override fun onResume() {
    super.onResume()
    window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return MainActivityDelegate(this, mainComponentName)
  }

  class MainActivityDelegate(activity: ReactActivity?, mainComponentName: String?) :
    ReactActivityDelegate(activity, mainComponentName) {
    override fun createRootView(): ReactRootView {
      val reactRootView = ReactRootView(context)
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED)
      return reactRootView
    }

    override fun isConcurrentRootEnabled(): Boolean {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
    }
  }
}
