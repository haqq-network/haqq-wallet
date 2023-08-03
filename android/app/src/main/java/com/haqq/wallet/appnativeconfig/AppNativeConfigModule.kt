package com.haqq.wallet.appnativeconfig

import com.facebook.react.bridge.*

class AppNativeConfigModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "AppNativeConfig"
  }

  @ReactMethod
  fun setBoolean(value: Boolean, key: String, promise: Promise) {
    val configKey = try {
      BooleanConfig.Key.valueOf(key)
    } catch (e: IllegalArgumentException) {
      promise.reject("ERROR", "Invalid key")
      return
    }

    BooleanConfig.storage[configKey] = value
    promise.resolve(null)
  }

  @ReactMethod
  fun getBoolean(key: String, promise: Promise) {
    val configKey = try {
      BooleanConfig.Key.valueOf(key)
    } catch (e: IllegalArgumentException) {
      promise.reject("ERROR", "Invalid key")
      return
    }

    if (BooleanConfig.storage.containsKey(configKey)) {
      promise.resolve(BooleanConfig.storage[configKey])
    } else {
      promise.reject("ERROR", "No value for key")
    }
  }
}
