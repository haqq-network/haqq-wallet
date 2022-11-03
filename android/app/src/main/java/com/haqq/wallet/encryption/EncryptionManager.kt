package com.haqq.wallet.encryption

import android.os.Build
import com.facebook.react.bridge.*
import com.haqq.wallet.toBase64
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.security.SecureRandom
import java.security.spec.KeySpec
import java.util.*
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.PBEKeySpec

@Serializable
data class EncryptedResult(val cipher: String, val iv: String, val salt: String, val method: String)

class EncryptionManager(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNEncryption"

  private val ENCRYPT_ALGO =
    if (Build.VERSION.SDK_INT >= 28) "ChaCha20-Poly1305" else "AES/CBC/PKCS7Padding"
  private val NONCE_LEN =  if (Build.VERSION.SDK_INT >= 28) 12 else 16

  @ReactMethod
  fun encrypt(password: String, data: String, promise: Promise) {
    val salt: ByteArray = randomKey(16)
    val nonce = getNonce();
    val key = keyFromPassword(password, salt)

    key?.let {
      val encrypted = encryptWithKey(key, data, nonce);

      val result = Json.encodeToString(
        EncryptedResult(
          cipher = encrypted.toBase64(),
          iv = nonce.toBase64(),
          salt = salt.toBase64(),
          method = "chacha"
        )
      )
      promise.resolve(result)
    }
    promise.reject("0", "encrypt")
  }

  @ReactMethod
  fun decrypt(password: String, data: String, promise: Promise) {
    val obj = Json.decodeFromString<EncryptedResult>(data)
    val key = keyFromPassword(password, Base64.getDecoder().decode(obj.salt))

    key?.let {
      val decrypted = decryptWithKey(key, obj.cipher, Base64.getDecoder().decode(obj.iv));
      if (decrypted != null) {
        return promise.resolve(decrypted.toString(Charsets.UTF_8))
      }
    }

    promise.reject("0", "decrypt")
  }

  private fun keyFromPassword(password: String, salt: ByteArray): SecretKey? {
    val algorithm = "PBKDF2withHmacSHA256"

    val derivedKeyLength = 256

    val iterations = 4096

    val spec: KeySpec = PBEKeySpec(password.toCharArray(), salt, iterations, derivedKeyLength)

    val f: SecretKeyFactory = SecretKeyFactory.getInstance(algorithm)

    return f.generateSecret(spec)
  }

  private fun randomKey(len: Int): ByteArray {
    val random: SecureRandom = SecureRandom.getInstance("SHA1PRNG")

    val key = ByteArray(len)
    random.nextBytes(key)

    return key
  }

  private fun encryptWithKey(key: SecretKey, data: String, nonce: ByteArray): ByteArray {
    val cipher: Cipher = Cipher.getInstance(ENCRYPT_ALGO)

    val iv = IvParameterSpec(nonce)
    cipher.init(Cipher.ENCRYPT_MODE, key, iv)

    return cipher.doFinal(data.toByteArray())
  }

  private fun decryptWithKey(key: SecretKey, data: String, nonce: ByteArray): ByteArray? {
    val cipher = Cipher.getInstance(ENCRYPT_ALGO)

    val iv = IvParameterSpec(nonce)

    cipher.init(Cipher.DECRYPT_MODE, key, iv)

    val data = Base64.getDecoder().decode(data)

    return cipher.doFinal(data)
  }

  private fun getNonce(): ByteArray {
    val nonce = ByteArray(NONCE_LEN)
    SecureRandom().nextBytes(nonce)
    return nonce
  }
}
