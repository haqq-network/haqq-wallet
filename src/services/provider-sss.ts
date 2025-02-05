import {generateEntropy} from '@haqq/provider-web3-utils';
import {utils} from '@haqq/rn-wallet-providers';
import {jsonrpcRequest} from '@haqq/shared-react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import BN from 'bn.js';

import {awaitForPopupClosed} from '@app/helpers';
import {cleanGoogle, getGoogleTokens} from '@app/helpers/get-google-tokens';
import {parseJwt} from '@app/helpers/parse-jwt';
import {AppStore} from '@app/models/app';
import {RemoteConfig} from '@app/services/remote-config';
import {ModalType} from '@app/types';
import {getHttpResponse} from '@app/utils';

export enum SssProviders {
  google = 'google',
  apple = 'apple',
  custom = 'custom',
}

const loggerCustom = Logger.create('onLoginCustom', {
  enabled: AppStore.isLogsEnabled,
});

export type SSSLoginOptions = {
  resetShares: boolean;
};

function extractLoginOptions(
  opts: SSSLoginOptions | undefined,
): SSSLoginOptions {
  const {resetShares} = opts || {
    resetShares: false,
  };

  return {
    resetShares,
  } as SSSLoginOptions;
}

export async function onLoginCustom(opts?: SSSLoginOptions) {
  loggerCustom.log('Starting onLoginCustom function');
  const {resetShares} = extractLoginOptions(opts);

  const email = await new Promise(resolve => {
    loggerCustom.log('Awaiting for popup to be closed');
    awaitForPopupClosed(ModalType.customProviderEmail, {
      onChange: (e: string) => {
        loggerCustom.log('Email input changed', {email: e});
        resolve(e);
      },
    });
  });
  loggerCustom.log('Email received from popup', {email});

  const verifier_url = RemoteConfig.get('sss_custom_url');
  loggerCustom.log('Retrieved custom URL from RemoteConfig', {verifier_url});

  if (!verifier_url) {
    loggerCustom.error('sss_custom_url is not set');
    throw new Error('sss_custom_url is not set');
  }

  loggerCustom.log('Fetching token from verifier URL', {verifier_url});
  const token = await fetch(verifier_url, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify({
      email,
    }),
  });
  loggerCustom.log('Token fetch completed');

  const authState = await getHttpResponse(token);
  loggerCustom.log('Received auth state from HTTP response');

  const authInfo = parseJwt(authState.idToken);
  loggerCustom.log('Parsed JWT from auth state', {authInfo});

  const verifier = RemoteConfig.get('sss_custom_provider');
  loggerCustom.log('Retrieved custom provider from RemoteConfig', {verifier});

  if (!verifier) {
    loggerCustom.error('sss_custom is not set');
    throw new Error('sss_custom is not set');
  }

  if (!authInfo) {
    loggerCustom.warn('Auth info is null, resolving with null');
    return Promise.resolve(null);
  }

  loggerCustom.log(
    'Calling onAuthorized with verifier, authInfo.sub, and idToken',
  );
  return await onAuthorized(
    verifier,
    authInfo.sub,
    authState.idToken,
    resetShares,
  );
}

const loggerGoogle = Logger.create('onLoginGoogle', {
  enabled: AppStore.isLogsEnabled,
});

export async function onLoginGoogle(
  opts?: SSSLoginOptions,
): Promise<Creds | null> {
  loggerGoogle.log('Starting onLoginGoogle function');
  const {resetShares} = extractLoginOptions(opts);

  let authState = {
    idToken: '',
  };
  try {
    loggerGoogle.log('Attempting to get Google tokens');
    authState = await getGoogleTokens();
    loggerGoogle.log('Successfully retrieved Google tokens');
  } catch (err) {
    loggerGoogle.error('Error getting Google tokens', {error: err});
    Logger.log('SSS_GOOGLE_ERROR', err);
  }
  const authInfo = parseJwt(authState.idToken);
  loggerGoogle.log('Parsed JWT from auth state', {authInfo});

  const verifier = RemoteConfig.get('sss_google_provider');
  loggerGoogle.log('Retrieved Google provider from RemoteConfig', {verifier});

  if (!verifier) {
    loggerGoogle.error('sss_google is not set');
    throw new Error('sss_google is not set');
  }

  if (!authInfo) {
    loggerGoogle.warn('Auth info is null, resolving with null');
    return Promise.resolve(null);
  }

  loggerGoogle.log(
    'Calling onAuthorized with verifier, authInfo.email, and idToken',
  );
  return await onAuthorized(
    verifier,
    authInfo.email,
    authState.idToken,
    resetShares,
  );
}

const loggerApple = Logger.create('onLoginApple', {
  enabled: AppStore.isLogsEnabled,
});

export async function onLoginApple(
  opts?: SSSLoginOptions,
): Promise<Creds | null> {
  loggerApple.log('Starting onLoginApple function');
  const {resetShares} = extractLoginOptions(opts);

  try {
    loggerApple.log('Performing Apple auth request');
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    loggerApple.log('Apple auth request completed');

    if (!appleAuthRequestResponse?.identityToken) {
      loggerApple.error('No identity token in Apple auth response');
      throw new Error('onLoginApple');
    }

    const {identityToken} = appleAuthRequestResponse;
    loggerApple.log('Retrieved identity token from Apple auth response');

    const authInfo = parseJwt(identityToken);
    loggerApple.log('Parsed JWT from identity token', {authInfo});

    const verifier = RemoteConfig.get('sss_apple_provider');
    loggerApple.log('Retrieved Apple provider from RemoteConfig', {verifier});

    if (!verifier) {
      loggerApple.error('sss_apple is not set');
      throw new Error('sss_apple is not set');
    }

    if (!authInfo) {
      loggerApple.warn('Auth info is null, resolving with null');
      return Promise.resolve(null);
    }

    // should clean google tokens after apple login
    // for correct work of getSocialLoginProviderForWallet in src/helpers/sss/get-social-login-provider-for-wallet.ts
    cleanGoogle();

    loggerApple.log(
      'Calling onAuthorized with verifier, authInfo.email, and identityToken',
    );
    return await onAuthorized(
      verifier,
      authInfo.email,
      identityToken,
      resetShares,
    );
  } catch (e: any) {
    if (e.code.toString() !== '1001') {
      loggerApple.error('Error in Apple login', {error: e});
      throw e;
    }
    loggerApple.warn('Apple auth was cancelled by user', {code: e.code});
  }
  return Promise.resolve(null);
}

export type Creds = {
  token: string;
  verifier: string;
  privateKey: string | null;
};

const loggerAuthorized = Logger.create('onAuthorized', {
  enabled: AppStore.isLogsEnabled,
});
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
  isResetShares = false,
): Promise<Creds> {
  loggerAuthorized.log('Starting onAuthorized function', {
    verifier,
    verifierId,
  });
  const creds: Creds = {
    token: token,
    verifier: verifier,
    privateKey: null,
  };
  loggerAuthorized.log('Initialized creds object');

  loggerAuthorized.log('Requesting node details');
  const nodeDetailsRequest = await jsonrpcRequest<{
    isNew: boolean;
    shares: [string, string][];
  }>(RemoteConfig.get('sss_generate_shares_url')!, 'shares', [
    verifier,
    token,
    isResetShares,
  ]);
  loggerAuthorized.log('Received node details', {
    isNew: nodeDetailsRequest.isNew,
    sharesCount: nodeDetailsRequest.shares.length,
  });

  loggerAuthorized.log('Generating entropy');
  const tmpPk = await generateEntropy(32);
  loggerAuthorized.log('Entropy generated');

  loggerAuthorized.log('Requesting shares');
  const shares = await Promise.all(
    nodeDetailsRequest.shares.map(s =>
      jsonrpcRequest<{key: string; hex_share: string}>(s[0], 'shareRequest', [
        verifier,
        token,
        tmpPk.toString('hex'),
      ])
        .then(r => {
          loggerAuthorized.log('Share request successful', {key: r.key});
          return [r.hex_share, s[1]];
        })
        .catch(() => {
          loggerAuthorized.warn('Share request failed');
          return [null, s[1]];
        }),
    ),
  );
  loggerAuthorized.log('All share requests completed');

  const shares2 = shares.filter(s => s[0] !== null && s[0] !== '') as [
    string,
    string,
  ][];
  loggerAuthorized.log('Filtered valid shares', {
    validSharesCount: shares2.length,
  });

  if (shares2.length) {
    loggerAuthorized.log('Performing Lagrange interpolation');
    creds.privateKey = utils
      .lagrangeInterpolation(
        shares2.map(s => new BN(s[0], 'hex')),
        shares2.map(s => new BN(s[1], 'hex')),
      )
      .toString('hex');
  } else {
    loggerAuthorized.warn('No valid shares to generate private key');
  }

  loggerAuthorized.log('onAuthorized function completed');
  return creds;
}
