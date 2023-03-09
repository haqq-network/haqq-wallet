import React, {useCallback, useState} from 'react';

import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {MpcProviders} from '@app/services/provider-mpc';

export type MpcNetworksProps = {
  onLogin: (provider: MpcProviders) => Promise<void>;
};

export const MpcNetworks = ({onLogin}: MpcNetworksProps) => {
  const [isAuth0, setIsAuth0] = useState(false);
  const [isDiscord, setIsDiscord] = useState(false);
  const [isGoogle, setIsGoogle] = useState(false);

  const onPressLoginAuth0 = useCallback(async () => {
    try {
      setIsAuth0(true);

      await onLogin(MpcProviders.coinbase);
    } finally {
      setIsAuth0(false);
    }
  }, [onLogin]);

  const onPressLoginDiscord = useCallback(async () => {
    try {
      setIsDiscord(true);

      await onLogin(MpcProviders.discord);
    } finally {
      setIsDiscord(false);
    }
  }, [onLogin]);

  const onPressLoginGoogle = useCallback(async () => {
    try {
      setIsGoogle(true);

      await onLogin(MpcProviders.google);
    } finally {
      setIsGoogle(false);
    }
  }, [onLogin]);

  return (
    <PopupContainer style={styles.container}>
      <Spacer />
      <Button
        title="Login with Google"
        loading={isGoogle}
        disabled={isAuth0 || isDiscord}
        onPress={onPressLoginGoogle}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Login with Discord"
        loading={isDiscord}
        disabled={isAuth0 || isGoogle}
        onPress={onPressLoginDiscord}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Login with Coinbase"
        loading={isAuth0}
        disabled={isDiscord || isGoogle}
        onPress={onPressLoginAuth0}
        variant={ButtonVariant.contained}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
