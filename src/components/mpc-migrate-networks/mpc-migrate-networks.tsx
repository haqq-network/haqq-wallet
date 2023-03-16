import React, {useCallback, useMemo, useState} from 'react';

import {appleAuth} from '@invertase/react-native-apple-authentication';

import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {MpcProviders} from '@app/services/provider-mpc';

export type MpcMigrateNetworksProps = {
  onLogin: (provider: MpcProviders) => Promise<void>;
};

export const MpcMigrateNetworks = ({onLogin}: MpcMigrateNetworksProps) => {
  const [isApple, setIsApple] = useState(false);
  const [isGoogle, setIsGoogle] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

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

  const onPressLoginCustom = useCallback(async () => {
    try {
      setIsCustom(true);

      await onLogin(MpcProviders.custom);
    } finally {
      setIsCustom(false);
    }
  }, [onLogin]);

  return (
    <PopupContainer style={styles.container}>
      <Spacer />
      <Button
        title="Login with Google"
        loading={isGoogle}
        disabled={isLoading && !isGoogle}
        onPress={onPressLoginGoogle}
        variant={ButtonVariant.contained}
      />
      <Spacer height={10} />
      <Button
        onPress={onPressLoginCustom}
        loading={isCustom}
        i18n={I18N.customNetwork}
        variant={ButtonVariant.contained}
      />
      {appleAuth.isSupported && (
        <>
          <Spacer height={8} />
          <Button
            title="Login with Apple"
            loading={isApple}
            disabled={isLoading && !isApple}
            onPress={onPressLoginApple}
            variant={ButtonVariant.contained}
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
