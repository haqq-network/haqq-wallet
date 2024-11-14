import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {HardwareWalletButton} from '@app/components/ui/hardware-wallet-button';
import {Terms} from '@app/components/ui/terms';
import {createTheme, getWindowHeight, getWindowWidth} from '@app/helpers';
import {I18N} from '@app/i18n';

export type CreateAgreementProps = {
  onPressRegularWallet: () => void;
  onPressHardwareWallet: () => void;
  testID?: string;
};

const calculateHeight = () =>
  Math.min(getWindowWidth(), getWindowHeight() * 0.355);

export const CreateAgreement = ({
  onPressRegularWallet,
  onPressHardwareWallet,
  testID,
}: CreateAgreementProps) => {
  return (
    <PopupContainer style={styles.container} testID={testID}>
      <View pointerEvents="none" style={styles.animation}>
        <LottieWrap
          source={require('@assets/animations/first-screen-animation.json')}
          autoPlay
          loop={false}
          resizeMode="contain"
          style={styles.animationInner}
        />
      </View>
      <Text
        variant={TextVariant.t4}
        position={TextPosition.center}
        style={styles.title}
        i18n={I18N.createAgreementTitle}
      />
      <Text
        variant={TextVariant.t11}
        position={TextPosition.center}
        style={styles.disclaimer}
        i18n={I18N.createAgreementText}
        color={Color.textBase2}
      />
      <Spacer />
      <Button
        testID={`${testID}_agree`}
        style={styles.button}
        variant={ButtonVariant.contained}
        i18n={I18N.createAgreementAgree}
        onPress={onPressRegularWallet}
      />
      <Spacer height={16} />
      <HardwareWalletButton
        onPress={onPressHardwareWallet}
        testID="welcome_connect_hardware_wallet"
        size={ButtonSize.large}
        style={styles.button}
      />
      <Spacer height={16} />
      <Terms style={styles.agreement} />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    height: () => calculateHeight(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationInner: {
    height: () => calculateHeight() - 20,
    width: 346,
  },
  title: {
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  disclaimer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    marginHorizontal: 20,
  },
  agreement: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
});
