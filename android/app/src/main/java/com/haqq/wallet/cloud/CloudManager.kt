package com.haqq.wallet.cloud

import android.view.Gravity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class CloudManager(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNCloud"

  private var reactContext: ReactApplicationContext

  init {
    this.reactContext = reactContext
  }

  override fun getConstants(): MutableMap<String, Any> {
    val constants = mutableMapOf<String, Any>()
    constants["isSupported"] = false
    constants["isEnabled"] = false
    return constants
  }

  @ReactMethod
  fun hasItem(key: String, promise: Promise) {
    promise.reject("0", "hasItem not_implemented")
  }

  @ReactMethod
  fun getItem(key: String, promise: Promise) {
    promise.reject("0", "getItem not_implemented")
  }

  @ReactMethod
  fun removeItem(key: String, promise: Promise) {
    promise.reject("0", "removeItem not_implemented")
  }

  @ReactMethod
  fun setItem(key: String, value: String, promise: Promise) {
    promise.reject("0", "removeItem not_implemented")
  }
}
