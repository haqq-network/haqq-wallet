package com.haqq.wallet

import com.haqq.wallet.services.HDKey
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class HDKeyTest {
  private val privateKey = byteArrayOfInts(202, 51, 19, 72, 127, 218, 2, 90, 113, 246, 240, 49, 151, 129, 46, 243, 130, 238, 150, 1, 54, 189, 62, 190, 149, 119, 70, 185, 148, 165, 16, 64)
  private val chainCode = byteArrayOfInts(196, 40, 137, 7, 223, 103, 100, 195, 22, 174, 58, 115, 199, 136, 141, 75, 184, 41, 74, 183, 105, 158, 253, 145, 175, 70, 234, 119, 80, 3, 188, 46)

  @Test
  fun initFromByteArray() {
    val key = HDKey(privateKey = privateKey, chainCode = chainCode)

    Assertions.assertEquals("0392937ffc2c26c527ec7d5cdb7a42b308016c63ebd7a610d3f61ae68d4ca38642", key.publicKey().toHex(), "initFromByteArray")
  }

  @Test
  fun initFromSeed() {
    val seed = "f6afca861c61fe47b15d74a24f9eb463c4ad7498ecb99e5d31b6ede7217396d62d437309f7fe08e40fe9303399b41a712e711c6a7ff8cd19516bcf0364bea430"

    val key = HDKey(seed = seed)

    Assertions.assertEquals("0392937ffc2c26c527ec7d5cdb7a42b308016c63ebd7a610d3f61ae68d4ca38642", key.publicKey().toHex(), "initFromSeed")
  }

  @Test
  fun deriveChild1() {
    val key = HDKey(privateKey = privateKey, chainCode = chainCode)
    val child = key.deriveChild("44'")

    Assertions.assertEquals("0217490122e0afde9cfa59203efea305fc4023bd8142685033f968505de82924a8", child.publicKey().toHex(), "deriveChild1 publicKey")
    Assertions.assertEquals("144719d3eb117e945c93b638d2267458832dd8bb0a96e01f83ff3e1df504fef9", child.privateKey().toHex(), "deriveChild1 privateKey")
    Assertions.assertEquals("74ab9c3324fa735c835a8cbe2745f3b41c2f34659b8d6748d215f84eedb946bd", child.chainCode().toHex(), "deriveChild1 chainCode")
  }

  @Test
  fun deriveChild2() {
   val key = HDKey(privateKey = privateKey, chainCode = chainCode)
    val child = key.deriveChild("44")

    Assertions.assertEquals("02553855bfc3b41be47d8c5eb32b4914d996be97370de74e793ec0b94020b01d24", child.publicKey().toHex(), "deriveChild2 publicKey")
    Assertions.assertEquals("47c0c06a581933d3c727cd7be76ec67612463da85bc920b460c4a92d86165e16", child.privateKey().toHex(), "deriveChild2 privateKey")
    Assertions.assertEquals("23ffd9a7983e7a1e580b12fdaa92d8ce755923668a017ab6d55d8833d2925058", child.chainCode().toHex(), "deriveChild2 chainCode")
  }

  @Test
  fun derive() {
   val key = HDKey(privateKey = privateKey, chainCode = chainCode)
    val child = key.derive("m/44'/60'/0'/0/0")

    Assertions.assertEquals("02fe389b960a6f40df9909acfede4641df434eb9d5e5db74e65827713456339a62", child.publicKey().toHex(), "derive publicKey")
    Assertions.assertEquals("c9b3168b5bc173fbd6d5a33943f0e2e045632dfce26120c58a8c8142ee76fc0f", child.privateKey().toHex(), "derive privateKey")
  }
}
