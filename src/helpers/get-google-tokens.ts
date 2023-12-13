import {GOOGLE_SIGNIN_WEB_CLIENT_ID} from '@env';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import EncryptedStorage from 'react-native-encrypted-storage';

export async function hasGoogleToken() {
  const exists = await EncryptedStorage.getItem('google_refresh_token');
  return !!exists;
}

export const setupGoogle = async () => {
  GoogleSignin.configure({
    webClientId: `${GOOGLE_SIGNIN_WEB_CLIENT_ID}.apps.googleusercontent.com`,
    scopes: [
      'openid',
      'profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
};

export const cleanGoogle = async () => {
  await setupGoogle();
  try {
    await GoogleSignin.revokeAccess();
  } catch (err) {
    Logger.log('GoogleSignin.revokeAccess', err);
  }
  try {
    await GoogleSignin.signOut();
  } catch (err) {
    Logger.log('GoogleSignin.signOut', err);
  }
};

export async function getGoogleTokens() {
  await setupGoogle();

  try {
    await GoogleSignin.signInSilently();
  } catch (e) {
    // Logger.log('SSS_GOOGLE_ERROR', 'getGoogleTokens ' + JSON.stringify(e));
    await GoogleSignin.signIn();
  }

  await GoogleSignin.addScopes({
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  const tokens = await GoogleSignin.getTokens();

  // Logger.log('SSS_GOOGLE_TOKENS', JSON.stringify(tokens));

  return {
    accessToken: tokens.accessToken,
    idToken: tokens.idToken,
  };
}
