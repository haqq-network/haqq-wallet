import {
  WEB3AUTH_AUTH0_CLIENT_ID,
  WEB3AUTH_AUTH0_DOMAIN,
  WEB3AUTH_AUTH0_VERIFIER,
  WEB3AUTH_CLIENT_ID,
} from '@env';
import CustomAuth from '@toruslabs/customauth-react-native-sdk';

export const serviceProviderOptions = {
  customAuthArgs: {
    baseUrl: 'http://localhost:3000/serviceworker/',
    enableLogging: true,
    network: 'testnet',
  },
};

export const storageLayerOptions = {
  hostUrl: 'https://metadata.tor.us',
};

export enum MpcProviders {
  google = 'google',
  auth0 = 'auth0',
  discord = 'discord',
  apple = 'apple',
  github = 'github',
}

export const verifierMap = {
  [MpcProviders.auth0]: {
    name: 'Auth0',
    typeOfLogin: 'jwt',
    clientId: WEB3AUTH_AUTH0_CLIENT_ID,
    verifier: WEB3AUTH_AUTH0_VERIFIER,
    jwtParams: {
      domain: WEB3AUTH_AUTH0_DOMAIN,
    },
  },
};

export function customAuthInit() {
  CustomAuth.init({
    clientId: WEB3AUTH_CLIENT_ID,
    redirectUri: 'haqq://web3auth/redirect',
    network: 'celeste',
    enableLogging: true,
    enableOneKey: false,
    skipSw: true,
  });
}
