import React, {useCallback, useEffect, useState} from 'react';

import CustomAuth from '@toruslabs/customauth-react-native-sdk';

import {Button, ButtonVariant, PopupContainer} from '@app/components/ui';

export const MpcNetworksScreen = () => {
  const [loginProgress, setLoginProgress] = useState(false);

  useEffect(() => {
    CustomAuth.init({
      browserRedirectUri: 'https://scripts.toruswallet.io/redirect.html',
      redirectUri: 'torusapp://org.torusresearch.customauthexample/redirect',
      network: 'celeste', // details for test net
      enableLogging: true,
      enableOneKey: false,
      skipSw: true,
    });
  }, []);

  const onPressLogin = useCallback(async () => {
    const loginDetails = await CustomAuth.triggerLogin(
      verifierMap[Providers.google],
    );
  }, []);

  return (
    <PopupContainer>
      <Button
        title="Login with Google"
        loading={loginProgress}
        onPress={onPressLogin}
        variant={ButtonVariant.contained}
      />
    </PopupContainer>
  );
};
