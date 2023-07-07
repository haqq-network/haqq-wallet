package com.haqq.wallet.apputils

import android.widget.Toast
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppUtilsManager(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNAppUtils"

  private var reactContext: ReactApplicationContext

  init {
    this.reactContext = reactContext
  }

  @ReactMethod
  fun goBack() {
    this.reactContext?.currentActivity?.moveTaskToBack(true)
  }
}
