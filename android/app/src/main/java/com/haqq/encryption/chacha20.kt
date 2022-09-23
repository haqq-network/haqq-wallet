package com.haqq.encryption

import java.lang.Exception
import java.math.BigInteger
import java.util.*
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 *
 * The possible reasons for using ChaCha20-Poly1305 which is a
 * stream cipher based authenticated encryption algorithm
 * 1. If the CPU does not provide dedicated AES instructions,
 * ChaCha20 is faster than AES
 * 2. ChaCha20 is not vulnerable to cache-collision timing
 * attacks unlike AES
 * 3. Since the nonce is not required to be random. There is
 * no overhead for generating cryptographically secured
 * pseudo random number
 *
 */
class CryptoChaCha20 {
    private val ENCRYPT_ALGO = "ChaCha20-Poly1305/None/NoPadding"
    private val KEY_LEN = 256
    private val NONCE_LEN = 12 //bytes
    private val NONCE_MIN_VAL = BigInteger("100000000000000000000000", 16)
    private val NONCE_MAX_VAL = BigInteger("ffffffffffffffffffffffff", 16)
    private val nonceCounter = NONCE_MIN_VAL

    @Throws(Exception::class)
    fun encrypt(input: ByteArray, key: SecretKeySpec): ByteArray {
        Objects.requireNonNull(input, "Input message cannot be null")
        Objects.requireNonNull(key, "key cannot be null")
        require(input.size != 0) { "Length of message cannot be 0" }
        require(key.encoded.size * 8 == KEY_LEN) { "Size of key must be 256 bits" }
        val cipher = Cipher.getInstance(ENCRYPT_ALGO)
        val nonce = nonce
        val ivParameterSpec = IvParameterSpec(nonce)
        cipher.init(Cipher.ENCRYPT_MODE, key, ivParameterSpec)
        val messageCipher = cipher.doFinal(input)

        // Prepend the nonce with the message cipher
        val cipherText = ByteArray(messageCipher.size + NONCE_LEN)
        System.arraycopy(nonce, 0, cipherText, 0, NONCE_LEN)
        System.arraycopy(
            messageCipher, 0, cipherText, NONCE_LEN,
            messageCipher.size
        )
        return cipherText
    }

    @Throws(Exception::class)
    fun decrypt(input: ByteArray, key: SecretKeySpec): ByteArray {
        Objects.requireNonNull(input, "Input message cannot be null")
        Objects.requireNonNull(key, "key cannot be null")
        require(input.size != 0) { "Input array cannot be empty" }
        val nonce = ByteArray(NONCE_LEN)
        System.arraycopy(input, 0, nonce, 0, NONCE_LEN)
        val messageCipher = ByteArray(input.size - NONCE_LEN)
        System.arraycopy(input, NONCE_LEN, messageCipher, 0, input.size - NONCE_LEN)
        val ivParameterSpec = IvParameterSpec(nonce)
        val cipher = Cipher.getInstance(ENCRYPT_ALGO)
        cipher.init(Cipher.DECRYPT_MODE, key, ivParameterSpec)
        return cipher.doFinal(messageCipher)
    }

    /**
     *
     * This method creates the 96 bit nonce. A 96 bit nonce
     * is required for ChaCha20-Poly1305. The nonce is not
     * a secret. The only requirement being it has to be
     * unique for a given key. The following function implements
     * a 96 bit counter which when invoked always increments
     * the counter by one.
     *
     * @return
     */
    val nonce: ByteArray
        get() {
            if (nonceCo);
        }
}
