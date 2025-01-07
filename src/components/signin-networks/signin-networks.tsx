import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {HardwareWalletButton} from '@app/components/ui/hardware-wallet-button';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {AppStore} from '@app/models/app';
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
  onPressHardwareWallet: () => void;
};

export const SigninNetworks = observer(
  ({
    onLogin,
    onSkip,
    isAppleSupported,
    isGoogleSupported,
    isCustomSupported,
    onPressHardwareWallet,
  }: SssNetworksProps) => {
    const [isLoading, setIsLoading] = useState<SssProviders | null>(null);

    const isApple = useMemo(
      () => isLoading === SssProviders.apple,
      [isLoading],
    );
    const isGoogle = useMemo(
      () => isLoading === SssProviders.google,
      [isLoading],
    );
    const isCustom = useMemo(
      () => isLoading === SssProviders.custom,
      [isLoading],
    );

    const onPressLogin = useCallback(
      (sssProvider: SssProviders) => async () => {
        try {
          setIsLoading(sssProvider);
          await onLogin(sssProvider);
        } finally {
          setIsLoading(null);
        }
      },
      [onLogin],
    );

    const mnemonicWalletsCount = Wallet.getAll().filter(
      wallet => wallet.type === WalletType.mnemonic,
    ).length;
    const sssWalletsCount = Wallet.getAll().filter(
      wallet => wallet.type === WalletType.sss,
    ).length;

    const isSSSDisabled = AppStore.isOnboarded
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
        {isAppleSupported && !isSSSDisabled && (
          <>
            <Spacer height={10} />
            <SocialButton
              loading={isApple}
              disabled={Boolean(isLoading && !isApple)}
              onPress={onPressLogin(SssProviders.apple)}
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
              disabled={Boolean(isLoading && !isGoogle)}
              onPress={onPressLogin(SssProviders.google)}
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
              disabled={Boolean(isLoading && !isCustom)}
              onPress={onPressLogin(SssProviders.custom)}
              i18n={I18N.customNetwork}
              variant={ButtonVariant.contained}
              testID="sss_login_custom"
            />
          </>
        )}
        {/* If there is at least one button on the screen then show Social Login description */}
        {(isCustomSupported || isGoogleSupported || isAppleSupported) &&
          !isSSSDisabled && (
            <>
              <Spacer height={10} />
              <Text
                variant={TextVariant.t15}
                position={TextPosition.center}
                i18n={I18N.sssNetworkWeb3AuthDescription}
                color={Color.textBase2}
              />
            </>
          )}
        <Spacer height={28} />
        <Button
          onPress={onSkip}
          i18n={I18N.signinNetworksSkip}
          variant={ButtonVariant.contained}
          testID="signin_network_skip"
        />
        <Spacer height={16} />
        <HardwareWalletButton
          onPress={onPressHardwareWallet}
          testID="signin_network_skip"
        />
        <Spacer height={16} />
      </PopupContainer>
    );
  },
);

const styles = createTheme({
  logo: {
    width: 375,
    height: 160,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
