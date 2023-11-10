import React, {useCallback, useMemo, useState} from 'react';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {SssProviders} from '@app/services/provider-sss';

import {SocialButton, SocialButtonVariant} from '../social-button';

export type SssMigrateNetworksProps = {
  isAppleSupported: boolean;
  isGoogleSupported: boolean;
  isCustomSupported: boolean;
  onLogin: (provider: SssProviders) => Promise<void>;
};

export const SssMigrateNetworks = ({
  onLogin,
  isAppleSupported,
  isCustomSupported,
  isGoogleSupported,
}: SssMigrateNetworksProps) => {
  const [isApple, setIsApple] = useState(false);
  const [isGoogle, setIsGoogle] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const isLoading = useMemo(
    () => isApple || isGoogle || isCustom,
    [isApple, isGoogle, isCustom],
  );

  const onPressLoginCustom = useCallback(async () => {
    try {
      setIsCustom(true);

      await onLogin(SssProviders.custom);
    } finally {
      setIsCustom(false);
    }
  }, [onLogin]);

  const onPressLoginGoogle = useCallback(async () => {
    try {
      setIsGoogle(true);

      await onLogin(SssProviders.google);
    } finally {
      setIsGoogle(false);
    }
  }, [onLogin]);

  const onPressLoginApple = useCallback(async () => {
    try {
      setIsApple(true);

      await onLogin(SssProviders.apple);
    } finally {
      setIsApple(false);
    }
  }, [onLogin]);

  return (
    <PopupContainer style={styles.container}>
      <Spacer centered>
        <LottieWrap
          source={require('../../../assets/animations/soc-login.json')}
          style={styles.logo}
          autoPlay
          loop
        />
      </Spacer>

      {isAppleSupported && (
        <>
          <Spacer height={10} />
          <SocialButton
            loading={isApple}
            disabled={isLoading && !isApple}
            onPress={onPressLoginApple}
            variant={SocialButtonVariant.apple}
          />
        </>
      )}
      {isGoogleSupported && (
        <>
          <Spacer height={10} />
          <SocialButton
            loading={isGoogle}
            disabled={isLoading && !isGoogle}
            onPress={onPressLoginGoogle}
            variant={SocialButtonVariant.google}
          />
        </>
      )}
      {isCustomSupported && (
        <>
          <Spacer height={10} />
          <Button
            loading={isCustom}
            disabled={isLoading && !isCustom}
            onPress={onPressLoginCustom}
            i18n={I18N.customNetwork}
            variant={ButtonVariant.contained}
          />
        </>
      )}

      <Spacer height={10} />
      <Text
        t15
        center
        i18n={I18N.sssNetworkWeb3AuthDescription}
        color={Color.textBase2}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  logo: {
    width: 148,
    height: 148,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
