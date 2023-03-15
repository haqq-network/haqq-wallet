import {GOOGLE_SIGNIN_WEB_CLIENT_ID} from '@env';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import EncryptedStorage from 'react-native-encrypted-storage';

export async function hasGoogleToken() {
  const exists = await EncryptedStorage.getItem('google_refresh_token');
  return !!exists;
}

export async function getGoogleTokens() {
  GoogleSignin.configure({
    webClientId: `${GOOGLE_SIGNIN_WEB_CLIENT_ID}.apps.googleusercontent.com`,
    scopes: [
      'openid',
      'profile',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });

  try {
    await GoogleSignin.signInSilently();
  } catch (e) {
    await GoogleSignin.signIn();
  }

  const tokens = await GoogleSignin.getTokens();

  return {
    accessToken: tokens.accessToken,
    idToken: tokens.idToken,
  };
}
