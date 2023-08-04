package com.haqq.wallet.appnativeconfig

object BooleanConfig {
  enum class Key {
    systemDialogEnabled,
  }

  var storage: MutableMap<Key, Boolean> = mutableMapOf()

  init {
    storage[Key.systemDialogEnabled] = false
  }
}
