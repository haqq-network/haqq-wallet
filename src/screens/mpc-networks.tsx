import React, {useCallback, useEffect} from 'react';

import CustomAuth from '@toruslabs/customauth-react-native-sdk';
import {authorize} from 'react-native-app-auth';

import {MpcNetworks} from '@app/components/mpc-networks/mpc-networks';
import {useTypedNavigation} from '@app/hooks';
import {
  MpcProviders,
  customAuthInit,
  verifierMap,
} from '@app/services/provider-mpc';

export const MpcNetworksScreen = () => {
  const navigation = useTypedNavigation();

  useEffect(() => {
    customAuthInit();
  }, []);

  const onLoginGoogle = useCallback(async () => {
    const config = {
      issuer: 'https://accounts.google.com',
      clientId:
        '915453653093-22njaj5n8vs0o332485b85iamk0vlt2f.apps.googleusercontent.com',
      redirectUrl:
        'com.googleusercontent.apps.915453653093-22njaj5n8vs0o332485b85iamk0vlt2f:/oauth2redirect/google',
      scopes: ['openid', 'profile'],
    };

    // Log in to get an authentication token
    const authState = await authorize(config);

    console.log('authState', JSON.stringify(authState));

    // console.log('onLoginGoogle 0');
    //
    // const fetchNodeDetails = new FetchNodeDetails({
    //   network: TORUS_NETWORK.TESTNET,
    // });
    //
    // console.log('onLoginGoogle 1');
    //
    // const torus = new TorusUtils({
    //   network: TORUS_NETWORK.TESTNET,
    // });
    //
    // console.log('onLoginGoogle 2');
    //
    // const verifier = 'haqq-dev-google-test-3';
    // const verifierId = user.user.email;
    //
    // const nodeDetails = await fetchNodeDetails.getNodeDetails({
    //   verifier,
    //   verifierId,
    // });
    //
    // console.log('onLoginGoogle 3', nodeDetails);
    //
    // const keyData = await torus.retrieveShares(
    //   nodeDetails.torusNodeEndpoints,
    //   nodeDetails.torusIndexes,
    //   verifier,
    //   {verifier_id: verifierId},
    //   tokens.idToken,
    // );
    // console.log('onLoginGoogle 4');
    // console.log(keyData);
    //
    // return keyData.privKey;
  }, []);

  const onLoginDiscord = useCallback(async () => {
    const config = {
      clientId: '1082588039072727072',
      clientSecret:
        'cba019376476a78db3fb03c4c2ad6ab18510bd5b72ad355b211a12d52c8ddc66',
      redirectUrl: 'haqq://oauthredirect',
      scopes: ['email', 'identify'],
      serviceConfiguration: {
        authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
        tokenEndpoint: 'https://discordapp.com/api/oauth2/token',
        revocationEndpoint: 'https://discordapp.com/api/oauth2/token/revoke',
      },
    };

    const result = await authorize(config);

    console.log('result', JSON.stringify(result));

    return '';
  }, []);

  const onLoginCoinbase = useCallback(async () => {
    const config = {
      clientId:
        'f18829d8570a51cdfb2fb5f41ab0f5597b420cd8bdf6343bc79202612bea2a14',
      clientSecret:
        '9f60a4d33aa3106fb6811e7a64dccaea2396448488f0a8f1dca42cdddb735fe0',
      redirectUrl: 'haqq://oauthredirect',
      scopes: ['wallet:accounts:read'], // https://developers.coinbase.com/docs/wallet/permissions
      serviceConfiguration: {
        authorizationEndpoint: 'https://www.coinbase.com/oauth/authorize',
        tokenEndpoint: 'https://api.coinbase.com/oauth/token',
        revocationEndpoint: 'https://api.coinbase.com/oauth/revoke',
      },
    };

    const result = await authorize(config);

    console.log('result', JSON.stringify(result));

    return '';
  }, []);

  const onLogin = useCallback(
    async (provider: MpcProviders) => {
      // try {
      let privateKey: string | null = null;
      switch (provider) {
        case MpcProviders.coinbase:
          privateKey = await onLoginCoinbase();
          break;
        case MpcProviders.google:
          privateKey = await onLoginGoogle();
          break;
        case MpcProviders.discord:
          privateKey = await onLoginDiscord();
          break;
        default:
          const loginDetails = await CustomAuth.triggerLogin(
            verifierMap[provider],
          );

          privateKey = loginDetails.privateKey;
          break;
      }
      if (privateKey) {
        navigation.navigate('mpcBackup', {
          privateKey,
        });
      }
      // } catch (e) {
      //   if (e instanceof Error) {
      //     console.log(e.message, e);
      //   }
      // }
    },
    [navigation, onLoginCoinbase, onLoginDiscord, onLoginGoogle],
  );

  return <MpcNetworks onLogin={onLogin} />;
};
