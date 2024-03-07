import React from 'react';

import {View} from 'react-native';

import {
  Button,
  ButtonVariant,
  Icon,
  IconsName,
  LottieWrap,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Color} from '@app/theme';

export interface WalletProtectionProps {
  onPressPhrase(): void;

  onPressSocial(): void;
}

export const WalletProtection = ({
  onPressPhrase,
  onPressSocial,
}: WalletProtectionProps) => {
  const animation = useThemeSelector({
    light: require('@assets/animations/protect-account-shield-light.json'),
    dark: require('@assets/animations/protect-account-shield-dark.json'),
  });
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <LottieWrap
            style={styles.shield}
            source={animation}
            autoPlay
            loop={false}
          />
        </View>

        <Spacer height={57} />

        <Text variant={TextVariant.t4} i18n={I18N.walletProtectionTitle} />
        <Text
          variant={TextVariant.t11}
          position={TextPosition.center}
          color={Color.textBase2}
          i18n={I18N.walletProtectionDescription}
        />

        <Spacer height={36} />

        <View style={styles.subtitle}>
          <Icon color={Color.graphicBase1} name={'link'} />
          <Spacer width={10} />
          <Text
            variant={TextVariant.t9}
            i18n={I18N.walletProtectionSocialLinkConnect}
          />
        </View>

        <Spacer height={4} />

        <Text
          variant={TextVariant.t14}
          color={Color.textBase2}
          position={TextPosition.center}
          i18n={I18N.walletProtectionSocialLinkConnectDescription}
        />

        <Spacer height={20} />

        <View style={styles.subtitle}>
          <Icon color={Color.graphicBase1} name={IconsName.phrase} />
          <Spacer width={10} />
          <Text
            variant={TextVariant.t9}
            i18n={I18N.walletProtectionRecoveryPhrase}
          />
        </View>

        <Spacer height={4} />

        <Text
          variant={TextVariant.t14}
          color={Color.textBase2}
          position={TextPosition.center}
          i18n={I18N.walletProtectionRecoveryPhraseDescription}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          onPress={onPressPhrase}
          style={styles.button}
          variant={ButtonVariant.contained}
          i18n={I18N.walletProtectionPhrase}
          testID="protect_phrase_button"
        />
        <Spacer width={10} />
        <Button
          onPress={onPressSocial}
          style={styles.button}
          variant={ButtonVariant.contained}
          i18n={I18N.walletProtectionSocial}
        />
      </View>
    </View>
  );
};

const styles = createTheme({
  button: {
    flex: 1,
  },
  subtitle: {
    flexDirection: 'row',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'space-around',
  },
  shield: {
    height: 143 + 60,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 143,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
