package com.haqq.wallet

import com.haqq.wallet.services.Mnemonic
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class MnemonicTest {
  @Test
  fun deriveChecksumBits() {
    val bytes =
      byteArrayOfInts(99, 217, 244, 233, 222, 163, 139, 170, 225, 251, 157, 138, 154, 175, 134, 155)

    assertEquals("1110", Mnemonic.deriveChecksumBits(bytes), "deriveChecksumBits")
  }

  @Test
  fun mnemonicFromEntropy() {
    val ent = Mnemonic.generateEntropy()
    val mnemonic = Mnemonic(ent)

    assertEquals(true, mnemonic.isValid(), "mnemonicFromEntropy")
  }

  @Test
  fun mnemonicFromBytes() {
    val ent =
      byteArrayOfInts(99, 217, 244, 233, 222, 163, 139, 170, 225, 251, 157, 138, 154, 175, 134, 155)
    val mnemonic = Mnemonic(ent)

    assertEquals(true, mnemonic.isValid(), "mnemonicFromEntropy isValid")
    assertEquals(
      "glow soul denial run december step margin inhale melody step ticket daughter",
      mnemonic.mnemonic(),
      "mnemonicFromEntropy mnemonic"
    )
    assertEquals(
      "f6afca861c61fe47b15d74a24f9eb463c4ad7498ecb99e5d31b6ede7217396d62d437309f7fe08e40fe9303399b41a712e711c6a7ff8cd19516bcf0364bea430",
      mnemonic.seed(),
      "mnemonicFromEntropy seed"
    )
  }

  @Test
  fun mnemonicFromString() {
    val mnemonic =
      Mnemonic("glow soul denial run december step margin inhale melody step ticket daughter")

    assertEquals(true, mnemonic.isValid(), "mnemonicFromString isValid")
    assertEquals(
      "f6afca861c61fe47b15d74a24f9eb463c4ad7498ecb99e5d31b6ede7217396d62d437309f7fe08e40fe9303399b41a712e711c6a7ff8cd19516bcf0364bea430",
      mnemonic.seed(),
      "mnemonicFromString seed"
    )
  }

  @Test
  fun mnemonicFromStringArray() {
    val mnemonic =
      Mnemonic(
        arrayOf(
          "glow",
          "soul",
          "denial",
          "run",
          "december",
          "step",
          "margin",
          "inhale",
          "melody",
          "step",
          "ticket",
          "daughter"
        )
      )

    assertEquals(true, mnemonic.isValid(), "mnemonicFromString isValid")
    assertEquals(
      "f6afca861c61fe47b15d74a24f9eb463c4ad7498ecb99e5d31b6ede7217396d62d437309f7fe08e40fe9303399b41a712e711c6a7ff8cd19516bcf0364bea430",
      mnemonic.seed(),
      "mnemonicFromString seed"
    )
  }
}
