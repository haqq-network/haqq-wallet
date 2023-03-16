import {CUSTOM_JWT_TOKEN, WEB3AUTH_CLIENT_ID} from '@env';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import CustomAuth from '@toruslabs/customauth-react-native-sdk';
import FetchNodeDetails from '@toruslabs/fetch-node-details';
import NodeDetailManager, {TORUS_NETWORK} from '@toruslabs/fetch-node-details';
import TorusUtils from '@toruslabs/torus.js';
import {TorusPublicKey} from '@toruslabs/torus.js/src/interfaces';
import prompt from 'react-native-prompt-android';

import {getGoogleTokens} from '@app/helpers/get-google-tokens';
import {parseJwt} from '@app/helpers/parse-jwt';

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
  discord = 'discord',
  apple = 'apple',
  github = 'github',
  custom = 'custom',
}

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

export async function onLoginCustom() {
  const email = await new Promise((resolve, reject) => {
    prompt(
      'Enter email',
      'some name@haqq',
      [
        {text: 'Cancel', onPress: () => reject(), style: 'cancel'},
        {text: 'OK', onPress: e => resolve(e)},
      ],
      {
        type: 'plain-text',
        cancelable: false,
      },
    );
  });

  console.log('email', email, CUSTOM_JWT_TOKEN);

  const token = await fetch(CUSTOM_JWT_TOKEN, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify({
      email,
    }),
  });

  const authState = await token.json();
  console.log('authState', authState);

  const authInfo = parseJwt(authState.idToken);
  console.log('authInfo', authInfo);

  return await onAuthorized('haqq-test', authInfo.sub, authState.idToken);
}

export async function onLoginGoogle() {
  const authState = await getGoogleTokens();
  const authInfo = parseJwt(authState.idToken);

  return await onAuthorized('haqq-google-dev', authInfo.sub, authState.idToken);
}

export async function onAuthorized(
  verifier: string,
  verifierId: string,
  token: string,
) {
  const fetchNodeDetails = new FetchNodeDetails({
    network: TORUS_NETWORK.TESTNET,
    proxyAddress: NodeDetailManager.PROXY_ADDRESS_TESTNET,
  });

  const torus = new TorusUtils({
    network: TORUS_NETWORK.TESTNET,
  });

  const nodeDetails = await fetchNodeDetails.getNodeDetails({
    verifier: verifier,
    verifierId: verifierId,
  });

  const torusPubKey = (await torus.getPublicAddress(
    nodeDetails.torusNodeEndpoints,
    nodeDetails.torusNodePub,
    {
      verifier,
      verifierId,
    },
    true,
  )) as TorusPublicKey;

  if (torusPubKey.typeOfUser === 'v1') {
    await torus.getOrSetNonce(torusPubKey.X, torusPubKey.Y);
  }

  const keyData = await torus.retrieveShares(
    nodeDetails.torusNodeEndpoints,
    nodeDetails.torusIndexes,
    verifier,
    {verifier_id: verifierId},
    token,
  );

  return keyData.privKey;
}

export async function onLoginApple() {
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  if (!appleAuthRequestResponse?.identityToken) {
    throw new Error('onLoginApple');
  }

  const {identityToken} = appleAuthRequestResponse;

  const authInfo = parseJwt(identityToken);

  return await onAuthorized('haqq-apple-dev-1', authInfo.email, identityToken);
}
