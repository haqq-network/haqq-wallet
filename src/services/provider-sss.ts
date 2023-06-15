import {
  CUSTOM_JWT_TOKEN,
  GENERATE_SHARES_URL,
  SSS_APPLE,
  SSS_CUSTOM,
  SSS_GOOGLE_ANDROID,
  SSS_GOOGLE_IOS,
} from '@env';
import {lagrangeInterpolation} from '@haqq/provider-sss-react-native';
import {generateEntropy} from '@haqq/provider-web3-utils';
import {jsonrpcRequest} from '@haqq/shared-react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import BN from 'bn.js';
import {Platform} from 'react-native';
import prompt from 'react-native-prompt-android';

import {getGoogleTokens} from '@app/helpers/get-google-tokens';
import {parseJwt} from '@app/helpers/parse-jwt';
import {getHttpResponse} from '@app/utils';

export enum SssProviders {
  google = 'google',
  apple = 'apple',
  custom = 'custom',
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

  const authState = await getHttpResponse(token);

  const authInfo = parseJwt(authState.idToken);
  return await onAuthorized(SSS_CUSTOM, authInfo.sub, authState.idToken);
}

export async function onLoginGoogle() {
  const authState = await getGoogleTokens();
  const authInfo = parseJwt(authState.idToken);

  return await onAuthorized(
    Platform.select({
      ios: SSS_GOOGLE_IOS,
      android: SSS_GOOGLE_ANDROID,
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

  return await onAuthorized(SSS_APPLE, authInfo.email, identityToken);
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
  }>(GENERATE_SHARES_URL, 'shares', [verifier, token, false]);

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

  const shares2 = shares.filter(s => s[0] !== null && s[0] !== '') as [
    string,
    string,
  ][];

  if (shares2.length) {
    creds.privateKey = lagrangeInterpolation(
      shares2.map(s => new BN(s[0], 'hex')),
      shares2.map(s => new BN(s[1], 'hex')),
    ).toString('hex');
  }

  return creds;
}
