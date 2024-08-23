import DefaultProvidersJson from '@assets/migrations/providers.json';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import {Easing} from 'react-native-reanimated';

import {NetworkProviderResponse} from '@app/services/backend';
import {PushNotificationTopicsEnum} from '@app/services/push-notifications';
import {AppLanguage, HexNumber, JsonRpcMetadata, Link} from '@app/types';

export const LIGHT_TEXT_BASE_1 = '#2E312D';
export const DARK_TEXT_BASE_1 = '#FFFFFF';

export const LIGHT_TEXT_BASE_2 = '#8E8E8E';
export const DARK_TEXT_BASE_2 = '#8E8E8E';

export const LIGHT_TEXT_BASE_3 = '#FFFFFF';
export const DARK_TEXT_BASE_3 = '#FFFFFF';

export const LIGHT_TEXT_GREEN_1 = '#01B26E';
export const DARK_TEXT_GREEN_1 = '#01B26E';

export const LIGHT_TEXT_RED_1 = '#E16363';
export const DARK_TEXT_RED_1 = '#E16363';

export const LIGHT_TEXT_YELLOW_1 = '#B26F1D';
export const DARK_TEXT_YELLOW_1 = '#EB9226';

export const LIGHT_TEXT_BLUE_1 = '#007AFF';
export const DARK_TEXT_BLUE_1 = '#007AFF';

export const LIGHT_TEXT_SECOND_1 = '#B2B4BB';
export const DARK_TEXT_SECOND_1 = '#5E6061';

export const LIGHT_TEXT_SECOND_2 = 'rgba(255, 255, 255, 0.8)';
export const DARK_TEXT_SECOND_2 = 'rgba(255, 255, 255, 0.8)';

export const LIGHT_GRAPHIC_BASE_1 = '#2F2F2F';
export const DARK_GRAPHIC_BASE_1 = '#FFFFFF';

export const LIGHT_GRAPHIC_BASE_2 = '#8E8E8E';
export const DARK_GRAPHIC_BASE_2 = '#8E8E8E';

export const LIGHT_GRAPHIC_BASE_3 = '#FFFFFF';
export const DARK_GRAPHIC_BASE_3 = '#FFFFFF';

export const LIGHT_GRAPHIC_RED_1 = '#E16363';
export const DARK_GRAPHIC_RED_1 = '#E16363';

export const LIGHT_GRAPHIC_BLUE_1 = '#0489D4';
export const DARK_GRAPHIC_BLUE_1 = '#0489D4';

export const LIGHT_GRAPHIC_GREEN_1 = '#01B26E';
export const DARK_GRAPHIC_GREEN_1 = '#01B26E';

export const LIGHT_GRAPHIC_GREEN_2 = '#04D484';
export const DARK_GRAPHIC_GREEN_2 = '#04D484';

export const LIGHT_GRAPHIC_SECOND_1 = '#EFEFEF';
export const DARK_GRAPHIC_SECOND_1 = '#2C3231';

export const LIGHT_GRAPHIC_SECOND_2 = '#CFD1DB';
export const DARK_GRAPHIC_SECOND_2 = '#56575C';

export const LIGHT_GRAPHIC_SECOND_3 = '#CCCDD2';
export const DARK_GRAPHIC_SECOND_3 = '#454647';

export const LIGHT_GRAPHIC_SECOND_4 = '#AAABB2';
export const DARK_GRAPHIC_SECOND_4 = '#616266';

export const LIGHT_BG_1 = '#FFFFFF';
export const DARK_BG_1 = '#181C1A';

export const LIGHT_BG_2 = '#EEF9F5';
export const DARK_BG_2 = '#25332E';

export const LIGHT_BG_3 = '#F4F8F8';
export const DARK_BG_3 = '#212624';

export const LIGHT_BG_4 = 'rgba(4, 212, 132, 0.5)';
export const DARK_BG_4 = 'rgba(4, 212, 132, 0.5)';

export const LIGHT_BG_5 = 'rgba(225, 99, 99, 0.8)';
export const DARK_BG_5 = 'rgba(225, 99, 99, 0.8)';

export const LIGHT_BG_6 = '#FCEDCE';
export const DARK_BG_6 = '#48361B';

export const LIGHT_BG_7 = '#F9EEEE';
export const DARK_BG_7 = '#574747';

export const LIGHT_BG_8 = '#F4F5F8';
export const DARK_BG_8 = '#292E2D';

export const LIGHT_BG_9 = 'rgba(0, 0, 0, 0.6)';
export const DARK_BG_9 = 'rgba(0, 0, 0, 0.6)';

export const LIGHT_BG_10 = '#181C1A';
export const DARK_BG_10 = '#181C1A';

export const QR_STATUS_BAR = '#b2b2b2';
export const QR_BACKGROUND = '#0000004D';

export const SYSTEM_BLUR_2 = 'rgba(255, 255, 255, 0.2)';
export const SYSTEM_BLUR_3 = 'rgba(255, 255, 255, 0.3)';

export const DEFAULT_CARD_BACKGROUND = '#03BF77';
export const DEFAULT_CARD_PATTERN = '#0DAC6F';

export const SHADOW_COLOR_1 = 'rgba(25, 26, 28, 0.06)';
export const SHADOW_COLOR_2 = 'rgba(25, 26, 28, 0.5)';

export const SHADOW_COLOR_3_LIGHT =
  Platform.OS === 'ios' ? 'rgba(25, 26, 28, 0.1)' : 'rgba(25, 26, 28, 0.4)';
export const SHADOW_COLOR_3_DARK = 'rgba(12, 14, 13, 1)';

export const PLACEHOLDER_GRAY = '#AAAAAA';
export const HR_GRAY = '#EEEEEE';

export const TRANSPARENT = 'transparent';

export const MAIN_ACCOUNT_NAME = 'Main account';

export const MAGIC_CARD_HEIGHT = 0.333;
export const MAGIC_NEWS_CARD_HEIGHT = 0.5625;

export const IS_ANDROID = Platform.OS === 'android';

export const SNOOZE_WALLET_BACKUP_MINUTES = 1440;

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

export const CARD_CIRCLE_TOTAL = 217;
export const CARD_RHOMBUS_TOTAL = 17;
export const CARD_DEFAULT_STYLE = 'card-circle-0';
export const REWARD_BANNER_DEFAULT_STYLE = 'reward-banner-1';

export const PIN_BANNED_TIMEOUT_SECONDS = 60;
export const PIN_BANNED_ATTEMPTS = 3;

export const USER_LAST_ACTIVITY_TIMEOUT_SECONDS = 900;

export const DEFAULT_HITSLOP = {top: 10, bottom: 10, left: 10, right: 10};

export const DEFAULT_USERNAME = 'username';
export const ETH_HD_SHORT_PATH = "44'/60'/0'/0"; // HD derivation path
export const LEDGER_HD_PATH_TEMPLATE = "44'/60'/index'/0/0"; // HD derivation path
export const ETH_HD_PATH = `${ETH_HD_SHORT_PATH}/0`; // HD derivation path

export const DEFAULT_PROVIDERS =
  DefaultProvidersJson as unknown as NetworkProviderResponse;
export const MAIN_NETWORK_ID = DEFAULT_PROVIDERS[1].id;
export const TEST_NETWORK_ID = DEFAULT_PROVIDERS[0].id;

export const PRIVACY_POLICY = 'https://www.boredgen.net/wallet/privacy-policy';
export const TERMS_OF_CONDITIONS =
  'https://www.boredgen.net/wallet/terms-and-conditions';

export const STORE_PAGE_URL = Platform.select({
  ios: `https://apps.apple.com/app/id${Config.APPSTORE_APP_ID}`,
  android: `https://play.google.com/store/apps/details?id=${Config.GOOGLE_PLAY_PACKAGE}`,
  default: 'https://haqq.network/wallet',
});

export const IS_IOS = Platform.OS === 'ios';
export const WEI_PRECISION = 18;
export const WEI = 10 ** WEI_PRECISION;

export const LONG_NUM_PRECISION = 8;
export const NUM_PRECISION = 2;
export const NUM_DELIMITER = ' ';

export const ANIMATION_DURATION = 300;
export const ANIMATION_TYPE = Easing.bezierFn(0.42, 0, 0.58, 0);

export const APP_NAME = 'HAQQ Wallet';
export const NETWORK_NAME = 'HAQQ Network';
export const LEDGER_APP = 'Ethereum';
export const PLATFORM_COMPANY = Platform.select({
  ios: 'Apple',
  android: 'Google',
});

export const COSMOS_PREFIX = 'haqq';
export const ISLM_DENOM = 'ISLM';
export const aISLM_DENOM = 'aISLM';
export const IBC_DENOM = 'IBC';
export const MULTICOIN_DENOM = 'multicoin';

export const STRINGS = {
  /** non-breaking space  */
  NBSP: '\xa0',
  /** line break  */
  N: '\n',
};

export const LIGHT_GOOGLE_BG = '#4285F4';
export const DARK_GOOGLE_BG = '#FFFFFF';

export const LIGHT_GOOGLE_TEXT = '#FFFFFF';
export const DARK_GOOGLE_TEXT = '#000000';

export const LIGHT_TWITTER_BG = '#55B4E5';
export const DARK_TWITTER_BG = '#FFFFFF';

export const LIGHT_TWITTER_TEXT = '#FFFFFF';
export const DARK_TWITTER_TEXT = '#55B4E5';

export const LIGHT_APPLE_BG = '#000000';
export const DARK_APPLE_BG = '#FFFFFF';

export const LIGHT_APPLE_TEXT = '#FFFFFF';
export const DARK_APPLE_TEXT = '#000000';

export const LIGHT_FACEBOOK_BG = '#1877F2';
export const DARK_FACEBOOK_BG = '#FFFFFF';

export const LIGHT_FACEBOOK_TEXT = '#FFFFFF';
export const DARK_FACEBOOK_TEXT = '#1877F2';

export const DARK_DISCORD_TEXT = '#603ACB';
export const LIGHT_DISCORD_TEXT = '#FFFFFF';

export const DARK_DISCORD_BG = '#FFFFFF';
export const LIGHT_DISCORD_BG = '#603ACB';

export const CARD_ACTION_CONTAINER_BG = 'rgba(255, 255, 255, 0.15)';

export const SPLASH_TIMEOUT_MS = 30_000;
export const AWAIT_NEW_BLOCK_MS = 10_000;

export const STORE_REHYDRATION_TIMEOUT_MS = 2000;

export const DEFAULT_FEE = 7;

export const HAQQ_DYNAMIC_LINKS_HOSTNAME = [
  'haqq.page.link',
  'preview.page.link',
];

export const TRANSACTION_TOPIC_VARIABLE_NAME = `notificationsTopic:${PushNotificationTopicsEnum.transactions}`;
export const NEWS_TOPIC_VARIABLE_NAME = `notificationsTopic:${PushNotificationTopicsEnum.news}`;
export const RAFFLE_TOPIC_VARIABLE_NAME = `notificationsTopic:${PushNotificationTopicsEnum.raffle}`;

export const DEFAULT_GOVERNANCE_LINK = 'https://shell.haqq.network/governance';

export const ZERO_HEX_NUMBER: HexNumber = '0x0';
export const FEE_ESTIMATING_TIMEOUT_MS = 5_000;

export const HAQQ_METADATA: JsonRpcMetadata = {
  url: 'https://haqq.network',
  iconUrl: 'https://haqq.network/icon.png',
};

export const TESTEDGE2_ETH_CHAIN_ID = 54211;
export const MAINNET_ETH_CHAIN_ID = 11235;

export const TEST_URLS: Partial<Link>[] = [
  {
    title: 'HAQQ Dashboard',
    url: 'https://shell.haqq.network',
    icon: 'https://shell.haqq.network/assets/favicon.png',
  },
  {
    title: 'HAQQ Vesting',
    url: 'https://vesting.haqq.network',
    icon: 'https://vesting.haqq.network/assets/favicon.svg',
  },
  {
    title: 'SushiSwap',
    url: 'https://www.sushi.com/swap?chainId=11235&token0=NATIVE&token1=0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
    icon: 'https://www.sushi.com/favicon.ico?v=1',
  },
  {title: 'MuslimGocci', url: 'https://muslimgocci.app'},
  {
    title: 'metamask test dapp',
    url: 'https://metamask.github.io/test-dapp/',
  },
  {title: 'HAQQ Faucet', url: 'https://testedge2.haqq.network'},
  {title: 'app uniswap', url: 'https://app.uniswap.org'},
  {title: 'safe', url: 'https://safe.testedge2.haqq.network'},
  {
    title: 'TFM.com',
    url: 'https://tfm.com',
  },
  {
    title: 'ChainList app',
    url: 'https://chainlist.org/',
  },
  {
    url: 'https://eip6963.org',
    title: 'EIP6963',
  },
];

export const DEVELOPER_MODE_DOCS =
  'https://github.com/haqq-network/haqq-wallet/blob/main/docs/developer-mode.md';

export const SUPPORTED_UR_TYPE = {
  CRYPTO_HDKEY: 'crypto-hdkey',
  CRYPTO_ACCOUNT: 'crypto-account',
  ETH_SIGNATURE: 'eth-signature',
  COSMOS_SIGNATURE: 'cosmos-signature',
};

export const KEYSTONE_NAME = 'Keystone';

export const RTL_LANGUAGES: AppLanguage[] = [
  // AppLanguage.ar
];
