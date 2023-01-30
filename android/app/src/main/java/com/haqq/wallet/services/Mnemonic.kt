package com.haqq.wallet.services

import com.haqq.wallet.byteArrayOfInts
import com.haqq.wallet.toBits
import com.haqq.wallet.toHex
import java.security.MessageDigest
import java.security.SecureRandom
import java.security.spec.KeySpec
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec


class Mnemonic {
  companion object {
    fun generateEntropy(strength: Int = 16): ByteArray {
      val entropyBuffer = ByteArray(strength)
      SecureRandom().nextBytes(entropyBuffer)

      return entropyBuffer
    }

    fun deriveChecksumBits(bytes: ByteArray): String {
      val ENT = bytes.size * 8;
      val CS = ENT / 32;
      return MessageDigest.getInstance("SHA-256").digest(bytes).toBits().substring(0, CS)
    }
  }

  private var _phrase: List<String> = listOf()
  private var _pass: String = ""

  constructor(bytes: ByteArray) {
    val bits = bytes.toBits() + deriveChecksumBits(bytes)

    val words = ArrayList<String>().toMutableList()

    bits.chunked(11).forEach {
      val pos = Integer.parseInt(it, 2)
      words.add(mnemonicWordlist[pos])
    }
    _phrase = words
  }

  constructor(phrase: String, pass: String = "") {
    _phrase = phrase.split(" ")
    _pass = pass
  }

  constructor(words: Array<String>, pass: String = "") {
    _phrase = words.toList()
    _pass = pass
  }

  fun isValid(): Boolean {
    var bits = ""

    _phrase.forEach {
      val pos = mnemonicWordlist.indexOf(it)
      bits += String.format("%11s", Integer.toBinaryString(pos)).replace(' ', '0')
    }

    val dividerIndex = bits.length / 33 * 32
    val entropyBits = bits.substring(0, dividerIndex)
    val checksumBits = bits.substring(dividerIndex)

    val bytes = ArrayList<Int>().toMutableList()

    entropyBits.chunked(8).forEach {
      bytes.add(Integer.parseInt(it.trim(), 2))
    }

    return checksumBits == deriveChecksumBits(byteArrayOfInts(*bytes.toIntArray()))
  }

  fun seed(): String {
    val mnemonicBytes = mnemonic().toCharArray()
    val saltBytes = "mnemonic$_pass".toByteArray()
    val algorithm = "PBKDF2withHmacSHA512"
    val spec: KeySpec = PBEKeySpec(mnemonicBytes, saltBytes, 2048, 512)
    val f: SecretKeyFactory = SecretKeyFactory.getInstance(algorithm)
    val r = f.generateSecret(spec)
    return r.encoded.toHex()
  }

  fun mnemonic(): String {
    return _phrase.joinToString(" ")
  }
}
