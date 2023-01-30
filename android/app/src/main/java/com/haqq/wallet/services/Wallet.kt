package com.haqq.wallet.services

import com.haqq.wallet.decodeHex
import com.haqq.wallet.isEqual
import com.haqq.wallet.toHex
import fr.acinq.secp256k1.Secp256k1
import org.komputing.khash.keccak.Keccak
import org.komputing.khash.keccak.KeccakParameter
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

class Wallet {
  private var _privateKey: ByteArray = ByteArray(32)
  private val hmacAlgo = "HmacSHA512"

  constructor(privateKey: ByteArray) {
    _privateKey = privateKey
  }

  constructor(privateKey: String) {
    val pk = if (privateKey.startsWith("0x")) {
      privateKey.substring(2)
    } else {
      privateKey
    }
    _privateKey = pk.decodeHex()
  }

  constructor(seed: String, masterSecret: ByteArray) {
    val signingKey = SecretKeySpec(masterSecret, hmacAlgo)
    val mac = Mac.getInstance(hmacAlgo)
    mac.init(signingKey)

    val bytes = mac.doFinal(seed.decodeHex())
    _privateKey = bytes.slice(0 until 32).toByteArray()
  }

  constructor(hdkey: HDKey) {
    _privateKey = hdkey.privateKey()
  }

  fun address(): ByteArray {
    val pub = publicKey()
    val hash = Keccak.digest(pub.slice(1 until pub.size).toByteArray(), KeccakParameter.KECCAK_256)
    return hash.slice(12 until hash.size).toByteArray()
  }

  fun privateKey(): ByteArray {
    return _privateKey
  }

  fun publicKey(): ByteArray {
    return Secp256k1.pubKeyCompress(Secp256k1.pubkeyCreate(_privateKey))
  }
}
