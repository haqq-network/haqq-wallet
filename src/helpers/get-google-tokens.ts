import {authorize, refresh} from 'react-native-app-auth';
import EncryptedStorage from 'react-native-encrypted-storage';

const config = {
  issuer: 'https://accounts.google.com',
  clientId:
    '674298748322-h050dolk1vra5a1hmfhrpt608mlc8430.apps.googleusercontent.com',
  redirectUrl:
    'com.googleusercontent.apps.674298748322-h050dolk1vra5a1hmfhrpt608mlc8430',
  scopes: [
    'openid',
    'profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appfolder',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file',
  ],
};

export async function hasGoogleToken() {
  const exists = await EncryptedStorage.getItem('google_refresh_token');
  return !!exists;
}

export async function getGoogleTokens() {
  let resp;
  try {
    const exists = await EncryptedStorage.getItem('google_refresh_token');
    if (!exists) {
      throw new Error('not_exists');
    }

    resp = await refresh(config, {
      refreshToken: exists,
    });
  } catch (e) {
    resp = await authorize(config);
  }

  if (resp.refreshToken) {
    await EncryptedStorage.setItem('google_refresh_token', resp.refreshToken);
  }

  return {
    accessToken: resp.accessToken,
    idToken: resp.idToken,
  };
}
