import React, {useMemo} from 'react';

import {
  I18nManager,
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
} from 'react-native';

import {Color, getColor} from '@app/colors';

export enum IconsName {
  address_book = 'address_book',
  arrow_back = 'arrow_back',
  arrow_forward_small = 'arrow_forward_small',
  arrow_forward = 'arrow_forward',
  arrow_receive = 'arrow_receive',
  arrow_send = 'arrow_send',
  bell = 'bell',
  block = 'block',
  brush = 'brush',
  check = 'check',
  circle_clear = 'circle_clear',
  circle_pattern = 'circle_pattern',
  clear = 'clear',
  close_circle = 'close_circle',
  close = 'close',
  color_flat = 'color_flat',
  color_gradient = 'color_gradient',
  copy = 'copy',
  currency = 'currency',
  deposit = 'deposit',
  doc = 'doc',
  drag = 'drag',
  flash = 'flash',
  flashlight = 'flashlight',
  global = 'global',
  governance = 'governance',
  help = 'help',
  image = 'image',
  info = 'info',
  inprogress = 'inprogress',
  instagram = 'instagram',
  invoice = 'invoice',
  islm = 'islm',
  language = 'language',
  list = 'list',
  link = 'link',
  lock = 'lock',
  market = 'market',
  networks = 'networks',
  news = 'news',
  no_proposal_voting = 'no_proposal_voting',
  paste = 'paste',
  pen = 'pen',
  ledger = 'ledger',
  logo = 'logo',
  plus_big = 'plus_big',
  plus_mid = 'plus_mid',
  providers = 'providers',
  qr_code = 'qr_code',
  qr_scanner = 'qr_scanner',
  romb_pattern = 'romb_pattern',
  search = 'search',
  servers = 'servers',
  settings = 'settings',
  shield = 'shield',
  staking = 'staking',
  star = 'star',
  swap = 'swap',
  swap_vertical = 'swap_vertical',
  time = 'time',
  ticket = 'ticket',
  timer_governance = 'timer_governance',
  timer = 'timer',
  trash = 'trash',
  twitter = 'twitter',
  twitter_outline = 'twitter_outline',
  up = 'up',
  user = 'user',
  wallet = 'wallet',
  warning = 'warning',
  discord = 'discord',
  google = 'google',
  apple = 'apple',
  facebook = 'facebook',
  wallet_connect = 'wallet_connect',
  phrase = 'pharse',
  browser = 'browser',
  square = 'square',
  share = 'share',
  refresh = 'refresh',
  disconnect = 'disconnect',
  more = 'more',
  circle_minus = 'circle_minus',
  reward_error = 'reward_error',
  star_fill = 'star_fill',
  list_squares = 'list_squares',
  squares = 'squares',
  export = 'export',
  scroll = 'scroll',
  coin = 'coin',
  staking_thin = 'staking_thin',
  home = 'home',
  contract = 'contract',
  eye_open = 'eye_open',
  eye_close = 'eye_close',
  arrow_sort = 'arrow_sort',
  shield_empty = 'shield_empty',
  shield_partially = 'shield_partially',
  privacy = 'privacy',
  import = 'import_icon',
  keystone = 'keystone',
  question = 'question',
  raffle_reward = 'raffle_reward',
  staking_reword = 'staking_reword',
  staking_redelegation = 'staking_redelegation',
  staking_delegation = 'staking_delegation',
  staking_undelegation = 'staking_undelegation',
  refresh_double = 'refresh_double',
  tune = 'tune',
}

export type IconSize =
  | {i12: boolean}
  | {i14: boolean}
  | {i16: boolean}
  | {i18: boolean}
  | {i20: boolean}
  | {i22: boolean}
  | {i24: boolean}
  | {i26: boolean}
  | {i32: boolean}
  | {i42: boolean}
  | {i48: boolean}
  | {i62: boolean}
  | {i72: boolean}
  | {i80: boolean}
  | {i120: boolean}
  | {};

export type IconProps = {
  name: IconsName | keyof typeof IconsName;
  color: string | Color;
  style?: StyleProp<ImageStyle>;
} & IconSize;

export const Icon = ({name, style, color, ...props}: IconProps) => {
  const container = useMemo(
    () =>
      StyleSheet.flatten([
        styles.i24Container,
        'i12' in props && styles.i12Container,
        'i14' in props && styles.i14Container,
        'i16' in props && styles.i16Container,
        'i18' in props && styles.i18Container,
        'i20' in props && styles.i20Container,
        'i22' in props && styles.i22Container,
        'i24' in props && styles.i24Container,
        'i26' in props && styles.i26Container,
        'i32' in props && styles.i32Container,
        'i42' in props && styles.i42Container,
        'i48' in props && styles.i48Container,
        'i62' in props && styles.i62Container,
        'i72' in props && styles.i72Container,
        'i80' in props && styles.i80Container,
        'i120' in props && styles.i120Container,
        style,
        {tintColor: getColor(color)},
      ]),
    [color, props, style],
  );
  const icon = useMemo(() => ({uri: name}), [name]);
  const rtlSupportedIcons = useMemo(
    () => [
      IconsName.arrow_back,
      IconsName.arrow_forward,
      IconsName.arrow_forward_small,
      IconsName.arrow_sort,
    ],
    [],
  );
  return (
    <Image
      accessible
      source={icon}
      style={[
        I18nManager.isRTL &&
          rtlSupportedIcons.includes(name as IconsName) &&
          styles.rtl,
        container,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  rtl: {transform: [{rotate: '180deg'}]},
  i120Container: {
    width: 120,
    height: 120,
  },
  i80Container: {
    width: 80,
    height: 80,
  },
  i72Container: {
    width: 72,
    height: 72,
  },
  i42Container: {
    width: 42,
    height: 42,
  },
  i48Container: {
    width: 48,
    height: 48,
  },
  i32Container: {
    width: 32,
    height: 32,
  },
  i24Container: {
    width: 24,
    height: 24,
  },
  i26Container: {
    width: 26,
    height: 26,
  },
  i22Container: {
    width: 22,
    height: 22,
  },
  i20Container: {
    width: 20,
    height: 20,
  },
  i18Container: {
    width: 18,
    height: 18,
  },
  i16Container: {
    width: 16,
    height: 16,
  },
  i14Container: {
    width: 14,
    height: 14,
  },
  i12Container: {
    width: 12,
    height: 12,
  },
  i62Container: {
    width: 62,
    height: 62,
  },
});
