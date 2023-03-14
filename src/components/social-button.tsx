import React, {useMemo} from 'react';

import {StyleSheet} from 'react-native';

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
    color: '#000000',
    textColor: '#ffffff',
    iconLeftColor: '#ffffff',
  },
  [SocialButtonVariant.discord]: {
    title: getText(I18N.socialButtonContinueWith, {provider: 'Discord'}),
    iconLeft: 'discord',
    color: '#603ACB',
    textColor: '#ffffff',
    iconLeftColor: '#ffffff',
  },
  [SocialButtonVariant.facebook]: {
    title: getText(I18N.socialButtonContinueWith, {provider: 'Facebook'}),
    iconLeft: 'facebook',
    color: '#1877F2',
    textColor: '#ffffff',
    iconLeftColor: '#ffffff',
  },
  [SocialButtonVariant.google]: {
    title: getText(I18N.socialButtonContinueWith, {provider: 'Google'}),
    iconLeft: 'google',
    color: '#346EF1',
    textColor: '#ffffff',
  },
  [SocialButtonVariant.twitter]: {
    title: getText(I18N.socialButtonContinueWith, {provider: 'Twitter'}),
    iconLeft: 'twitter',
    color: '#55B4E5',
    textColor: '#ffffff',
    iconLeftColor: '#ffffff',
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
  },
});
