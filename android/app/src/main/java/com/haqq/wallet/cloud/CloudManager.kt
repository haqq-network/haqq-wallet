package com.haqq.wallet.cloud

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.api.Scope
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential
import com.google.api.client.http.ByteArrayContent
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.jackson2.JacksonFactory
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes
import com.google.api.services.drive.model.File
import com.haqq.wallet.R
import java.io.ByteArrayOutputStream

class CloudManager(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNCloud"

  private var reactContext: ReactApplicationContext

  init {
    this.reactContext = reactContext
  }

  override fun getConstants(): MutableMap<String, Any> {
    val constants = mutableMapOf<String, Any>()
    constants["isSupported"] = this.isGooglePlayServicesAvailable()
    constants["isEnabled"] = this.isGooglePlayServicesAvailable() && this.isUserSignedIn()
    return constants
  }

  @ReactMethod
  fun hasItem(key: String, promise: Promise) {
    val exists = getFileId(key)

    if (exists != null) {
      promise.resolve(true)
    } else {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun getItem(key: String, promise: Promise) {
    try {
      val googleDriveService = getDriveService()
        ?: return promise.reject("0", "googleDriveService unavailable")

      val fileId = getFileId(key)

      val outputStream = ByteArrayOutputStream()
      googleDriveService.files().get(fileId).executeMediaAndDownloadTo(outputStream)

      promise.resolve(outputStream.toString())
    } catch (e: Exception) {
      promise.reject("0", "getItem")
    }
  }

  @ReactMethod
  fun removeItem(key: String, promise: Promise) {
    try {
      val googleDriveService = getDriveService()
        ?: return promise.reject("0", "googleDriveService unavailable")
      val fileId = getFileId(key)
      googleDriveService.Files().delete(fileId).execute()
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("0", "removeItem")
    }
  }

  @ReactMethod
  fun setItem(key: String, value: String, promise: Promise) {
    try {
      val googleDriveService = getDriveService()
        ?: return promise.reject("0", "googleDriveService unavailable")
      val exists = getFileId(key)
      val contentStream = ByteArrayContent.fromString("text/plain", value)
      if (exists != null) {
        val contentFile = File()
        googleDriveService.Files().update(exists, contentFile, contentStream).execute()
      } else {
        val gfile = com.google.api.services.drive.model.File()
        gfile.name = key
        googleDriveService.Files().create(gfile, contentStream).execute()
      }
      promise.resolve(true)
    } catch (e: Exception) {
      e.printStackTrace()
      promise.reject("Cloud.setItem", e)
    }
  }

  private fun getFileId(key: String): String? {
    val googleDriveService = getDriveService()
      ?: return null

    val result = googleDriveService.files().list().apply {
      spaces = "drive"
      fields = "files(id, name)"
      q = "name='${key}'"
    }.execute()

    if (result.files.size >= 1) {
      return result.files[0].id
    }

    return null
  }

  private fun isUserSignedIn(): Boolean {
    val account = GoogleSignIn.getLastSignedInAccount(this.reactContext)
    return account != null
  }

  private fun getDriveService(): Drive? {
    val googleAccount = GoogleSignIn.getLastSignedInAccount(this.reactContext)
    val credential = GoogleAccountCredential.usingOAuth2(
      this.reactContext, listOf(DriveScopes.DRIVE_FILE)
    )

    if (googleAccount == null) {
      val signInOptions: GoogleSignInOptions =
        GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
          .requestScopes(Scope(DriveScopes.DRIVE_FILE))
          .build()
      val client: GoogleSignInClient = GoogleSignIn.getClient(this.reactContext, signInOptions)

      val googleAccount = GoogleSignIn.getSignedInAccountFromIntent(client.signInIntent)
      credential.selectedAccount = googleAccount.result.account

    } else {
      credential.selectedAccount = googleAccount.account!!
    }

    return Drive.Builder(
      NetHttpTransport(),
      JacksonFactory.getDefaultInstance(),
      credential
    )
      .setApplicationName(this.reactContext.resources.getString(R.string.app_name))
      .build()
  }

  private fun isGooglePlayServicesAvailable(): Boolean {
    val googleApiAvailability: GoogleApiAvailability = GoogleApiAvailability.getInstance()
    val resultCode: Int = googleApiAvailability.isGooglePlayServicesAvailable(this.reactContext)
    return resultCode == ConnectionResult.SUCCESS
  }

}
