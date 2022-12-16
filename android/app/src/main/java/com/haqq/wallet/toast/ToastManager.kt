package com.haqq.wallet.toast

import android.view.Gravity
import android.widget.Toast
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ToastManager(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNToast"

  private var reactContext: ReactApplicationContext

  init {
    this.reactContext = reactContext
  }

  @ReactMethod
  fun message(msg: String, theme: String) {
    val toast = Toast.makeText(reactContext, msg, Toast.LENGTH_SHORT)
    toast.show();
  }
}
