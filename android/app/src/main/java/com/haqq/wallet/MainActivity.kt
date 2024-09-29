package com.haqq.wallet

import android.content.res.Configuration
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import android.view.WindowManager
import androidx.fragment.app.Fragment
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen
import com.facebook.react.modules.i18nmanager.I18nUtil;

class MainActivity : ReactActivity() {
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String {
    try {
      return if (RootUtil.isDeviceRooted) {
        "jailbreak"
      } else {
        "haqq"
      }
    } catch (e: Exception) {
      println("getMainComponentName error")
      println(e)
      return "haqq"
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreen.show(this, true)
    val sharedI18nUtilInstance: I18nUtil = I18nUtil.getInstance()
    sharedI18nUtilInstance.allowRTL(this, sharedI18nUtilInstance.isRTL(this))
    super.onCreate(null)
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)

    if (Build.VERSION.SDK_INT in 19..20) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
        setWindowFlag(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS, true)
      }
    }

    if (Build.VERSION.SDK_INT >= 19) {
      window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
    }

    if (Build.VERSION.SDK_INT >= 21) {
      setWindowFlag(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS, false)
      window.statusBarColor = Color.TRANSPARENT
      window.navigationBarColor = Color.TRANSPARENT
    }

    if (Build.VERSION.SDK_INT >= 23) {
      window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR)
    }  else {
      window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN)
    }

    // Change the system button color
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        val window: Window = window
        var flags: Int = window.decorView.systemUiVisibility
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            flags = flags or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        }
        window.decorView.systemUiVisibility = flags
        if (isDarkTheme()) {
            window.navigationBarColor = Color.parseColor("#181C1A") // Replace with your desired color for dark theme
        } else {
            window.navigationBarColor = Color.WHITE // Replace with your desired color for light theme
        }
    }
  }

  private fun isDarkTheme(): Boolean {
      val currentNightMode: Int = resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
      return currentNightMode == Configuration.UI_MODE_NIGHT_YES
  }

  private fun setWindowFlag(bits: Int, on: Boolean) {
    val win = window
    val winParams = win.attributes
    if (on) {
      winParams.flags = winParams.flags or bits
    } else {
      winParams.flags = winParams.flags and bits.inv()
    }
    win.attributes = winParams
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
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return DefaultReactActivityDelegate(
        this,
        mainComponentName,
        DefaultNewArchitectureEntryPoint.fabricEnabled
    )
  }
}
