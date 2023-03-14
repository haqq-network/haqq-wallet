import React, {useCallback, useMemo, useState} from 'react';

import {appleAuth} from '@invertase/react-native-apple-authentication';

import {PopupContainer, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {MpcProviders} from '@app/services/provider-mpc';

import {SocialButton, SocialButtonVariant} from '../social-button';

export type MpcNetworksProps = {
  onLogin: (provider: MpcProviders) => Promise<void>;
};

export const MpcNetworks = ({onLogin}: MpcNetworksProps) => {
  const [isApple, setIsApple] = useState(false);
  const [isGoogle, setIsGoogle] = useState(false);

  const isLoading = useMemo(() => isApple || isGoogle, [isApple, isGoogle]);

  const onPressLoginGoogle = useCallback(async () => {
    try {
      setIsGoogle(true);

      await onLogin(MpcProviders.google);
    } finally {
      setIsGoogle(false);
    }
  }, [onLogin]);

  const onPressLoginApple = useCallback(async () => {
    try {
      setIsApple(true);

      await onLogin(MpcProviders.apple);
    } finally {
      setIsApple(false);
    }
  }, [onLogin]);

  return (
    <PopupContainer style={styles.container}>
      <Spacer />
      <SocialButton
        loading={isGoogle}
        disabled={isLoading && !isGoogle}
        onPress={onPressLoginGoogle}
        variant={SocialButtonVariant.google}
      />
      {appleAuth.isSupported && (
        <>
          <Spacer height={8} />
          <SocialButton
            loading={isApple}
            disabled={isLoading && !isApple}
            onPress={onPressLoginApple}
            variant={SocialButtonVariant.apple}
          />
        </>
      )}
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
