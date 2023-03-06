import React, {useCallback, useEffect, useState} from 'react';

import CustomAuth from '@toruslabs/customauth-react-native-sdk';

import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
} from '@app/components/ui';
import {useTypedNavigation} from '@app/hooks';
import {
  MpcProviders,
  customAuthInit,
  verifierMap,
} from '@app/services/provider-mpc';

export const MpcNetworksScreen = () => {
  const [loginProgress, setLoginProgress] = useState(false);
  const navigation = useTypedNavigation();

  useEffect(() => {
    customAuthInit();
  }, []);

  const onLogin = useCallback(
    async (provider: MpcProviders) => {
      try {
        setLoginProgress(true);

        const loginDetails = await CustomAuth.triggerLogin(
          verifierMap[provider],
        );

        navigation.navigate('mpcQuestion', {
          privateKey: loginDetails.privateKey,
        });
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message, e);
        }
      } finally {
        setLoginProgress(false);
      }
    },
    [navigation],
  );

  const onPressLoginGoogle = useCallback(async () => {
    await onLogin(MpcProviders.google);
  }, [onLogin]);

  const onPressLoginGithub = useCallback(async () => {
    await onLogin(MpcProviders.github);
  }, [onLogin]);

  return (
    <PopupContainer>
      <Button
        title="Login with Google"
        loading={loginProgress}
        onPress={onPressLoginGoogle}
        variant={ButtonVariant.contained}
      />
      <Spacer height={4} />
      <Button
        title="Login with Github"
        loading={loginProgress}
        onPress={onPressLoginGithub}
        variant={ButtonVariant.contained}
      />
    </PopupContainer>
  );
};
