package com.haqq.wallet.services

import com.haqq.wallet.decodeHex
import fr.acinq.secp256k1.Secp256k1
import org.komputing.khash.keccak.Keccak
import org.komputing.khash.keccak.KeccakParameter

class Wallet {
  private var _privateKey: ByteArray = ByteArray(32)

  constructor(privateKey: ByteArray) {
    _privateKey = privateKey
  }

  constructor(privateKey: String) {
    val pk = if(privateKey.startsWith("0x")) {
      privateKey.substring(2)
    } else {
      privateKey
    }
    _privateKey = pk.decodeHex()
  }

  constructor(hdkey: HDKey) {
    _privateKey = hdkey.privateKey()
  }

  fun address(): ByteArray {
    val pub = Secp256k1.pubkeyCreate(_privateKey)
    val hash = Keccak.digest(pub.slice(1 until pub.size).toByteArray(), KeccakParameter.KECCAK_256)
    return hash.slice(12 until hash.size).toByteArray()
  }

  fun privateKey(): ByteArray {
    return _privateKey
  }
}
