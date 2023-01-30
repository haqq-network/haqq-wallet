package com.haqq.wallet

import java.nio.ByteBuffer
import java.util.*

fun ByteArray.toBase64(): String =
  String(Base64.getEncoder().encode(this))

fun ByteArray.toHex(): String = joinToString(separator = "") { eachByte -> "%02x".format(eachByte) }

fun ByteArray.toBits(): String {
  return joinToString(separator = "") {
    String.format("%8s", Integer.toBinaryString((it.toInt() + 256) % 256)).replace(' ', '0')
  }
}

fun Long.toByte32Array(): ByteArray {
  val buffer = ByteBuffer.allocate(Long.SIZE_BYTES)
  buffer.putLong(this)
  return buffer.array().copyOfRange(4, Long.SIZE_BYTES)
}

fun String.decodeHex(): ByteArray {
  check(length % 2 == 0) { "Must have an even length" }

  return chunked(2)
    .map { it.toInt(16).toByte() }
    .toByteArray()
}
