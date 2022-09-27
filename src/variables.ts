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

export const CARD_COLORS = {
  [WalletCardStyle.defaultGreen]: ['#03BF77', '#03BF77'],
  [WalletCardStyle.defaultBlack]: ['#383838', '#383838'],
  [WalletCardStyle.defaultBlue]: ['#125BCA', '#1D63A5'],
  [WalletCardStyle.defaultYellow]: ['#E8D06F', '#B59235'],
};
export const GRADIENT_START = {x: 0.014851485, y: 0};
export const GRADIENT_END = {x: 1.022643564, y: 0.939510417};
