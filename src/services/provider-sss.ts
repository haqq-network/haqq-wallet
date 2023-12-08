import {GENERATE_SHARES_URL} from '@env';
import {lagrangeInterpolation} from '@haqq/provider-sss-react-native';
import {generateEntropy} from '@haqq/provider-web3-utils';
import {jsonrpcRequest} from '@haqq/shared-react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import BN from 'bn.js';

import {getGoogleTokens} from '@app/helpers/get-google-tokens';
import {parseJwt} from '@app/helpers/parse-jwt';
import {RemoteConfig} from '@app/services/remote-config';

export enum SssProviders {
  google = 'google',
  apple = 'apple',
}

export async function onLoginGoogle() {
  let authState = {
    idToken: '',
  };
  try {
    authState = await getGoogleTokens();
  } catch (err) {
    Logger.log('SSS_GOOGLE_ERROR', err);
  }
  const authInfo = parseJwt(authState.idToken);

  const verifier = RemoteConfig.get('sss_google');

  if (!verifier) {
    Logger.log('SSS_GOOGLE_ERROR', 'sss_google is not set');
    throw new Error('sss_google is not set');
  }

  return await onAuthorized(verifier, authInfo.email, authState.idToken);
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

  const verifier = RemoteConfig.get('sss_apple');

  if (!verifier) {
    throw new Error('sss_apple is not set');
  }

  return await onAuthorized(verifier, authInfo.email, identityToken);
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
  }>(
    RemoteConfig.get_env(
      'sss_generate_shares_url',
      GENERATE_SHARES_URL,
    ) as string,
    'shares',
    [verifier, token, false],
  );

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
