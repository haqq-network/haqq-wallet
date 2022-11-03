package com.haqq.wallet.services

import com.haqq.wallet.byteArrayOfInts
import com.haqq.wallet.decodeHex
import com.haqq.wallet.toByte32Array
import com.haqq.wallet.toHex
import fr.acinq.secp256k1.Secp256k1
import java.io.IOException
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec


class HDKey {
  private var _privateKey: ByteArray = ByteArray(32)
  private var _chainCode: ByteArray = ByteArray(32)

  private val hmacAlgo = "HmacSHA512"
  private val masterSecret = "Bitcoin seed".toByteArray()
  private val hdSpacer = byteArrayOfInts(0)
  private val hardenedOffset = 2147483648

  constructor(privateKey: ByteArray, chainCode: ByteArray) {
    _privateKey = privateKey
    _chainCode = chainCode
  }

  constructor(seed: String) {
    val signingKey = SecretKeySpec(masterSecret, hmacAlgo)
    val mac = Mac.getInstance(hmacAlgo)
    mac.init(signingKey)

    val bytes = mac.doFinal(seed.decodeHex())
    _privateKey = bytes.slice(0 until 32).toByteArray()
    _chainCode = bytes.slice(32 until 64).toByteArray()
  }

  fun publicKey(): ByteArray {
    val pub = Secp256k1.pubkeyCreate(_privateKey)
    return Secp256k1.pubKeyCompress(pub)
  }

  fun privateKey(): ByteArray {
    return _privateKey
  }

  fun chainCode(): ByteArray {
    return _chainCode
  }

  fun derive(path: String): HDKey {
    val segments = path.split("/")

    var key = HDKey(_privateKey, _chainCode)

    segments.forEach {
      if (it.lowercase() != "m") {
        key = key.deriveChild(it)
      }
    }

    return key
  }

  fun deriveChild(segment: String): HDKey {
    val childIndex = segment.replace("'", "").toInt()

    val pk = if (segment.endsWith("'")) {
      hdSpacer + _privateKey + (childIndex + hardenedOffset).toByte32Array()
    } else {
      publicKey() + childIndex.toLong().toByte32Array()
    }

    val signingKey = SecretKeySpec(_chainCode, hmacAlgo)
    val mac = Mac.getInstance(hmacAlgo)
    mac.init(signingKey)

    val key = mac.doFinal(pk)
    try {
      val privateKey = Secp256k1.privKeyTweakAdd(_privateKey, key.slice(0 until 32).toByteArray())
      return HDKey(privateKey, key.slice(32 until 64).toByteArray())
    } catch (_: IOException) {
      val nextSegment = if (segment.endsWith("'")) {
        "${childIndex + 1}'"
      } else {
        "${childIndex + 1}"
      }

      return deriveChild(nextSegment)
    }
  }
}
