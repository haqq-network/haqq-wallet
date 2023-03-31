import {
  CUSTOM_JWT_TOKEN,
  MPC_APPLE,
  MPC_GOOGLE_ANDROID,
  MPC_GOOGLE_IOS,
  MPC_NETWORK,
  MPC_STORE_URL,
} from '@env';
import {
  Share,
  ShareEncrypted,
  lagrangeInterpolation,
} from '@haqq/provider-mpc-react-native';
import {hashPasswordToBN} from '@haqq/provider-mpc-react-native/dist/hash-password-to-bn';
import {accountInfo, generateEntropy} from '@haqq/provider-web3-utils';
import {jsonrpcRequest} from '@haqq/shared-react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import BN from 'bn.js';
import {Platform} from 'react-native';
import prompt from 'react-native-prompt-android';

import {getGoogleTokens} from '@app/helpers/get-google-tokens';
import {parseJwt} from '@app/helpers/parse-jwt';

export const serviceProviderOptions = {
  customAuthArgs: {
    baseUrl: 'http://localhost:3000/serviceworker/',
    enableLogging: true,
    network: MPC_NETWORK,
  },
};

export const storageLayerOptions = {
  hostUrl: MPC_STORE_URL,
};

export enum MpcProviders {
  google = 'google',
  apple = 'apple',
  custom = 'custom',
}

const curveN = new BN(
  'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141',
  'hex',
);

export async function encryptShare(
  share: Share,
  password: string,
): Promise<ShareEncrypted> {
  const hash = await hashPasswordToBN(password);
  let nonce = new BN(share.share, 'hex').sub(hash);
  nonce = nonce.umod(curveN);

  const publicShare = await accountInfo(share.share);

  return {
    nonce: nonce.toString('hex'),
    publicShare: publicShare.publicKey,
    shareIndex: share.shareIndex,
    polynomialID: share.polynomialID,
  };
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

  const authInfo = parseJwt(authState.idToken);
  return await onAuthorized('custom', authInfo.sub, authState.idToken);
}

export async function onLoginGoogle() {
  const authState = await getGoogleTokens();
  const authInfo = parseJwt(authState.idToken);

  return await onAuthorized(
    Platform.select({
      ios: MPC_GOOGLE_IOS,
      android: MPC_GOOGLE_ANDROID,
    }) as string,
    authInfo.email,
    authState.idToken,
  );
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

  return await onAuthorized(MPC_APPLE, authInfo.email, identityToken);
}

export type Creds = {
  token: string;
  verifier: string;
  privateKey: string | null;
};

/**
 * Fetch private key from shares
 * @param verifier
 * @param verifierId
 * @param token
 */
export async function onAuthorized(
  verifier: string,
  verifierId: string,
  token: string,
): Promise<Creds> {
  const creds: Creds = {
    token: token,
    verifier: verifier,
    privateKey: null,
  };

  const nodeDetailsRequest = await jsonrpcRequest<{
    isNew: boolean;
    shares: [string, string][];
  }>('http://localhost:8069', 'shares', [verifier, token, false]);

  const tmpPk = await generateEntropy(32);
  const shares = await Promise.all(
    nodeDetailsRequest.shares.map(s =>
      jsonrpcRequest<{key: string; hex_share: string}>(s[0], 'shareRequest', [
        verifier,
        token,
        tmpPk.toString('hex'),
      ])
        .then(r => [r.hex_share, s[1]])
        .catch(() => [null, s[1]]),
    ),
  );

  const shares2 = shares.filter(s => s[0] !== null) as [string, string][];

  if (shares2.length) {
    creds.privateKey = lagrangeInterpolation(
      shares2.map(s => new BN(s[0], 'hex')),
      shares2.map(s => new BN(s[1], 'hex')),
    ).toString('hex');
  }

  return creds;
}
