import React, {useCallback, useMemo, useState} from 'react';

import {appleAuth} from '@invertase/react-native-apple-authentication';
import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {MpcProviders} from '@app/services/provider-mpc';

import {SocialButton, SocialButtonVariant} from '../social-button';

export type MpcNetworksProps = {
  onLogin: (provider: MpcProviders) => Promise<void>;
  onLoginLaterPress(): void;
};

export const MpcNetworks = ({onLogin, onLoginLaterPress}: MpcNetworksProps) => {
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
      <Image source={{uri: 'islm-logo-circles'}} style={styles.logo} />

      <View style={styles.content}>
        {/* <SocialButton variant={SocialButtonVariant.discord} />
        <Spacer height={10} />
        <SocialButton variant={SocialButtonVariant.twitter} />
        <Spacer height={10} />
        <SocialButton variant={SocialButtonVariant.facebook} /> */}

        {appleAuth.isSupported && (
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

        <Spacer height={10} />
        <SocialButton
          loading={isGoogle}
          disabled={isLoading && !isGoogle}
          onPress={onPressLoginGoogle}
          variant={SocialButtonVariant.google}
        />

        <Spacer height={10} />
        <Text
          t15
          i18n={I18N.mpcNetworkWeb3AuthDescription}
          color={Color.textBase2}
        />

        <Spacer height={24} />
      </View>

      <Button
        onPress={onLoginLaterPress}
        i18n={I18N.mpcLoginLater}
        variant={ButtonVariant.text}
        textColor={Color.textRed1}
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
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
});
