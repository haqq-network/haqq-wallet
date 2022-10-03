import {Platform} from 'react-native';
import {WalletCardStyle} from './types';

export const TEXT_BASE_1 = '#2F2F2F';
export const TEXT_BASE_2 = '#8E8E8E';
export const TEXT_BASE_3 = '#FFFFFF';

export const TEXT_GREEN_1 = '#01B26E';
export const TEXT_RED_1 = '#E16363';
export const TEXT_YELLOW_1 = '#B26F1D';
export const TEXT_SECOND_1 = '#B2B4BB';
export const TEXT_SECOND_2 = 'rgba(255, 255, 255, 0.8)';

export const GRAPHIC_BASE_1 = '#2F2F2F';
export const GRAPHIC_BASE_2 = '#8E8E8E';
export const GRAPHIC_BASE_3 = '#FFFFFF';
export const GRAPHIC_BASE_4 = '#CFD1DB';
export const GRAPHIC_RED_1 = '#E16363';
export const GRAPHIC_GREEN_1 = '#01B26E';
export const GRAPHIC_GREEN_2 = '#04D484';
export const GRAPHIC_SECOND_1 = '#EFEFEF';
export const GRAPHIC_SECOND_2 = '#CFD1DB';
export const GRAPHIC_SECOND_3 = '#CCCDD2';
export const GRAPHIC_SECOND_4 = '#AAABB2';

export const BG_1 = '#FFFFFF';
export const BG_2 = '#EEF9F5';
export const BG_3 = '#F4F8F8';
export const BG_4 = 'rgba(4, 212, 132, 0.5)';
export const BG_5 = 'rgba(225, 99, 99, 0.8)';
export const BG_6 = 'rgba(247, 193, 90, 0.3)';
export const BG_7 = '#F9EEEE';
export const BG_8 = '#F4F5F8';

export const MAIN_ACCOUNT_NAME = 'Main account';

export const MAGIC_CARD_HEIGHT = 0.632835821;

export const IS_ANDROID = Platform.OS === 'android';

export const SNOOZE_WALLET_BACKUP_MINUTES = 15;

export const CARD_COLORS = {
  [WalletCardStyle.defaultGreen]: ['#03BF77', '#03BF77'],
  [WalletCardStyle.defaultBlack]: ['#383838', '#383838'],
  [WalletCardStyle.defaultBlue]: ['#125BCA', '#1D63A5'],
  [WalletCardStyle.defaultYellow]: ['#E8D06F', '#B59235'],
  [WalletCardStyle.defaultViolet]: ['#965cb8', '#6e2c94'],
};

export const CARD_PATTERN = {
  [WalletCardStyle.defaultGreen]: '#0DAC6F',
  [WalletCardStyle.defaultBlack]: '#4E4E4E',
  [WalletCardStyle.defaultBlue]: '#0E57AC',
  [WalletCardStyle.defaultYellow]: '#BA9C43',
  [WalletCardStyle.defaultViolet]: '#663285',
};

export const GRADIENT_START = {x: 0, y: 0};
export const GRADIENT_END = {x: 1, y: 1};

export const FLAT_PRESETS = [
  ['#2E94BF', '#2E94BF', '#2880A6'],
  ['#382EBF', '#382EBF', '#3028A6'],
  ['#662EBF', '#662EBF', '#5828A6'],
  ['#BFBF2E', '#BFBF2E', '#A6A628'],
  ['#A7BF2E', '#A7BF2E', '#91A628'],
  ['#55BF2E', '#55BF2E', '#49A628'],
  ['#BF2E51', '#BF2E51', '#A62845'],
  ['#0A1F29', '#0A1F29', '#16475C'],
  ['#0C0A29', '#0C0A29', '#1B165C'],
  ['#160A29', '#160A29', '#31165C'],
  ['#29290A', '#29290A', '#5C5C16'],
  ['#24290A', '#24290A', '#505C16'],
  ['#12290A', '#12290A', '#295C16'],
  ['#260910', '#260910', '#5C1626'],
];

export const GRADIENT_PRESETS = [
  ['#6BB6D6', '#368DB2', '#4089A8'],
  ['#726BD6', '#3E36B2', '#4740A8'],
  ['#946BD6', '#6536B2', '#6840A8'],
  ['#D6B26B', '#B28936', '#A88540'],
  ['#CDD66B', '#A8B236', '#9FA840'],
  ['#88D66B', '#57B236', '#5CA840'],
  ['#D66B6B', '#B23636', '#A84040'],
  ['#2B4A57', '#0F2833', '#306880'],
  ['#2E2B57', '#120F33', '#363080'],
  ['#3C2B57', '#1D0F33', '#4F3080'],
  ['#57482B', '#33270F', '#806530'],
  ['#53572B', '#30330F', '#798030'],
  ['#37572B', '#19330F', '#468030'],
  ['#8A4545', '#661F1F', '#19330F'],
];
