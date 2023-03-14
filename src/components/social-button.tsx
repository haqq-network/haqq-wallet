import React, {useMemo} from 'react';

import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {I18N, getText} from '@app/i18n';

import {Button, ButtonProps} from './ui';

export enum SocialButtonVariant {
  apple = 'apple',
  google = 'google',
  facebook = 'facebook',
  twitter = 'twitter',
  discord = 'discord',
}

export type SocialButtonProps = {
  variant: SocialButtonVariant;
} & Omit<ButtonProps, 'variant'>;

const SOCIAL_BUTTONS_DATA_MAP: Record<
  SocialButtonVariant,
  Partial<Omit<ButtonProps, 'onPress'>>
> = {
  [SocialButtonVariant.apple]: {
    title: getText(I18N.socialButtonContinueWith, {provider: 'Apple'}),
    iconLeft: 'apple',
    color: Color.socialAppleBg,
    textColor: Color.socialAppleText,
    iconLeftColor: Color.socialAppleText,
  },
  [SocialButtonVariant.discord]: {
    title: getText(I18N.socialButtonContinueWith, {provider: 'Discord'}),
    iconLeft: 'discord',
    color: Color.socialDiscordBg,
    textColor: Color.socialDiscordText,
    iconLeftColor: Color.socialDiscordText,
  },
  [SocialButtonVariant.facebook]: {
    title: getText(I18N.socialButtonContinueWith, {provider: 'Facebook'}),
    iconLeft: 'facebook',
    color: Color.socialFacebookBg,
    textColor: Color.socialFacebookText,
    iconLeftColor: Color.socialFacebookText,
  },
  [SocialButtonVariant.google]: {
    title: getText(I18N.socialButtonContinueWith, {provider: 'Google'}),
    iconLeft: 'google',
    color: Color.socialGoogleBg,
    textColor: Color.socialGoogleText,
    iconLeftStyle: {
      backgroundColor: '#ffffff',
      borderRadius: 100,
    },
  },
  [SocialButtonVariant.twitter]: {
    title: getText(I18N.socialButtonContinueWith, {provider: 'Twitter'}),
    iconLeft: 'twitter',
    color: Color.socialTwitterBg,
    textColor: Color.socialTwitterText,
    iconLeftColor: Color.socialTwitterText,
  },
};

export const SocialButton = ({variant, style, ...props}: SocialButtonProps) => {
  const data = useMemo(() => SOCIAL_BUTTONS_DATA_MAP[variant], [variant]);
  const flattenStyles = useMemo(
    () => StyleSheet.flatten([styles.button, data.style, style]),
    [data.style, style],
  );

  /// @ts-ignore
  return <Button {...data} style={flattenStyles} {...props} />;
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    width: '100%',
  },
});
