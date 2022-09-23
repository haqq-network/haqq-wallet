package com.haqq.encryption

import com.facebook.react.bridge.*
import java.security.SecureRandom
import java.security.spec.KeySpec
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

class EncryptionManager(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNEncryption"

  @ReactMethod
  fun encrypt(password: String, data: String, promise: Promise) {
    val key = randomKey();

    promise.resolve("Create encrypt called with password: $password and data: $data")
  }

  @ReactMethod
  fun decrypt(password: String, data: String, promise: Promise) {
    promise.resolve("Create decrypt called with password: $password and data: $data")
  }

  fun keyFromPassword(password: String, salt: ByteArray): ByteArray? {
    val algorithm = "PBKDF2withHmacSHA256"

    val derivedKeyLength = 32

    val iterations = 4096

    val spec: KeySpec = PBEKeySpec(password.toCharArray(), salt, iterations, derivedKeyLength)

    val f: SecretKeyFactory = SecretKeyFactory.getInstance(algorithm)

    return f.generateSecret(spec).getEncoded()
  }

  fun randomKey(len: Int): ByteArray {
    val random: SecureRandom = SecureRandom.getInstance("SHA1PRNG")

    val key = ByteArray(len)
    random.nextBytes(key)

    return key
  }
}
