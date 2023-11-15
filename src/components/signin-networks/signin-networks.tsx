import React, {useCallback, useMemo, useState} from 'react';

import {appleAuth} from '@invertase/react-native-apple-authentication';
import {observer} from 'mobx-react';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {SssProviders} from '@app/services/provider-sss';
import {WalletType} from '@app/types';

import {SocialButton, SocialButtonVariant} from '../social-button';

export type SssNetworksProps = {
  isAppleSupported: boolean;
  isGoogleSupported: boolean;
  isCustomSupported: boolean;
  onLogin: (provider: SssProviders) => Promise<void>;
  onSkip: () => void;
};

export const SigninNetworks = observer(
  ({
  onLogin,
  onSkip,
  isAppleSupported,
  isGoogleSupported,
  isCustomSupported,
}: SssNetworksProps) => {
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

    const mnemonicWalletsCount = Wallet.getAll().filter(
      wallet => wallet.type === WalletType.mnemonic,
    ).length;
    const sssWalletsCount = Wallet.getAll().filter(
      wallet => wallet.type === WalletType.sss,
    ).length;

    const isSSSDisabled = app.onboarded
      ? mnemonicWalletsCount >= 1 || sssWalletsCount >= 1
      : false;

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
        {/* <SocialButton variant={SocialButtonVariant.discord} />
        <Spacer height={10} />
        <SocialButton variant={SocialButtonVariant.twitter} />
        <Spacer height={10} />
        <SocialButton variant={SocialButtonVariant.facebook} /> */}

      {isAppleSupported && !isSSSDisabled && (
        <>
          <Spacer height={10} />
          <SocialButton
            loading={isApple}
            disabled={isLoading && !isApple}
            onPress={onPressLoginApple}
            variant={SocialButtonVariant.apple}
            testID="sss_login_apple"
          />
        </>
      )}
      {isGoogleSupported && !isSSSDisabled && (
        <>
          <Spacer height={10} />
          <SocialButton
            loading={isGoogle}
            disabled={isLoading && !isGoogle}
            onPress={onPressLoginGoogle}
            variant={SocialButtonVariant.google}
            testID="sss_login_google"
          />
        </>
      )}
      {isCustomSupported && !isSSSDisabled && (
        <>
          <Spacer height={10} />
          <Button
            loading={isCustom}
            disabled={isLoading && !isCustom}
            onPress={onPressLoginCustom}
            i18n={I18N.customNetwork}
            variant={ButtonVariant.contained}
            testID="sss_login_custom"
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
      <Spacer height={28} />
      <Button
        onPress={onSkip}
        i18n={I18N.signinNetworksSkip}
        variant={ButtonVariant.contained}
        testID="signin_network_skip"
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
