package com.haqq.wallet.ethutils

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.haqq.wallet.services.HDKey
import com.haqq.wallet.services.Mnemonic
import com.haqq.wallet.services.Wallet
import com.haqq.wallet.toHex
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.IOException

@Serializable
data class EthUtilsResult(val address: String, val privateKey: String, val mnemonic: String?)

class EthUtilsManager(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNEthUtils"

  @ReactMethod
  fun generateMnemonic(strength: Int, promise: Promise) {
    try {
      val bytes =  Mnemonic.generateEntropy(strength = strength)
      val mnemonic = Mnemonic(bytes = bytes)

      promise.resolve(mnemonic.mnemonic())

    } catch (e: IOException) {
      promise.reject("0", "generateMnemonic")
    }
  }

  @ReactMethod
  fun restoreFromPrivateKey(privateKey: String, promise: Promise) {
    try {
      val wallet = Wallet(privateKey = privateKey)

      val result = Json.encodeToString(
        EthUtilsResult(
          address = "0x${wallet.address().toHex()}",
          privateKey = "0x${wallet.privateKey().toHex()}",
          mnemonic = null
        )
      )

      promise.resolve(result)
    } catch (e: IOException) {
      promise.reject("0", "restoreFromPrivateKey")
    }
  }

  @ReactMethod
  fun restoreFromMnemonic(mnemonicPhrase: String, path: String, promise: Promise) {
    try {
      val mnemonic = Mnemonic(phrase = mnemonicPhrase, pass = "")

      if (!mnemonic.isValid()) {
        throw IllegalArgumentException("invalid mnemonic")
      }

      val hdKey = HDKey(seed = mnemonic.seed())
      val child = hdKey.derive(path)

      val wallet = Wallet(hdkey = child)

      val result = Json.encodeToString(
        EthUtilsResult(
          address = "0x${wallet.address().toHex()}",
          privateKey = "0x${wallet.privateKey().toHex()}",
          mnemonic = mnemonic.mnemonic()
        )
      )

      promise.resolve(result)
    } catch (_: IOException) {

    } catch (e: java.lang.IllegalArgumentException) {
      promise.reject("0", e)
    }
  }
}
