import React, {useCallback, useEffect} from 'react';

import {appleAuth} from '@invertase/react-native-apple-authentication';
import FetchNodeDetails from '@toruslabs/fetch-node-details';
import NodeDetailManager, {TORUS_NETWORK} from '@toruslabs/fetch-node-details';
import TorusUtils from '@toruslabs/torus.js';
import {TorusPublicKey} from '@toruslabs/torus.js/src/interfaces';

import {MpcNetworks} from '@app/components/mpc-networks/mpc-networks';
import {getGoogleTokens} from '@app/helpers/get-google-tokens';
import {parseJwt} from '@app/helpers/parse-jwt';
import {useTypedNavigation} from '@app/hooks';
import {MpcProviders, customAuthInit} from '@app/services/provider-mpc';

export const MpcNetworksScreen = () => {
  const navigation = useTypedNavigation();

  useEffect(() => {
    customAuthInit();
  }, []);

  const onAuthorized = useCallback(
    async (verifier: string, verifierId: string, token: string) => {
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
    },
    [],
  );

  const onLoginGoogle = useCallback(async () => {
    const authState = await getGoogleTokens();
    const authInfo = parseJwt(authState.idToken);

    return await onAuthorized(
      'haqq-google-dev',
      authInfo.sub,
      authState.idToken,
    );
  }, [onAuthorized]);

  const onLoginApple = useCallback(async () => {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    if (!appleAuthRequestResponse?.identityToken) {
      throw new Error('onLoginApple');
    }

    const {identityToken} = appleAuthRequestResponse;

    const authInfo = parseJwt(identityToken);

    return await onAuthorized(
      'haqq-apple-dev-1',
      authInfo.email,
      identityToken,
    );
  }, [onAuthorized]);

  const onLogin = useCallback(
    async (provider: MpcProviders) => {
      let privateKey: string | null = null;
      switch (provider) {
        case MpcProviders.apple:
          privateKey = await onLoginApple();
          break;
        case MpcProviders.google:
          privateKey = await onLoginGoogle();
          break;
      }
      if (privateKey) {
        navigation.navigate('mpcBackup', {
          privateKey,
        });
      }
    },
    [navigation, onLoginApple, onLoginGoogle],
  );

  return <MpcNetworks onLogin={onLogin} />;
};
