package com.haqq.wallet.ethutils

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.haqq.wallet.decodeHex
import com.haqq.wallet.services.HDKey
import com.haqq.wallet.services.Mnemonic
import com.haqq.wallet.services.Wallet
import com.haqq.wallet.toHex
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.IOException

@Serializable
data class EthUtilsResult(val address: String, val privateKey: String, val mnemonic: String?, val path: String?, val rootAddress: String?, val publicKey: String)

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
          mnemonic = null,
          path = null,
          rootAddress = null,
          publicKey = wallet.publicKey().toHex()
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

      val rootWallet = Wallet(seed = mnemonic.seed(), masterSecret = hdKey.masterSecret)

      val result = Json.encodeToString(
        EthUtilsResult(
          address = "0x${wallet.address().toHex()}",
          privateKey = "0x${wallet.privateKey().toHex()}",
          mnemonic = mnemonic.mnemonic(),
          path = path,
          rootAddress = "0x${rootWallet.address().toHex()}",
          publicKey = wallet.publicKey().toHex()
        )
      )

      promise.resolve(result)
    } catch (_: IOException) {

    } catch (e: java.lang.IllegalArgumentException) {
      promise.reject("0", e)
    }
  }

  @ReactMethod
  fun sign(privateKey: String, message: String, promise: Promise) {
    try {
      val wallet = Wallet(privateKey = privateKey)

      val msg = if (message.startsWith("0x")) {
        message.substring(2)
      } else {
        message
      }

      val resp = wallet.sign(msg.decodeHex())

      promise.resolve(resp.toHex());
    } catch (_: IOException) {

    } catch (e: java.lang.IllegalArgumentException) {
      promise.reject("0", e)
    }
  }
}
