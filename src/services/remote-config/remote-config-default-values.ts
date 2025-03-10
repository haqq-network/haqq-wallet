import Config from 'react-native-config';

import {
  BALANCE_MULTIPLIER,
  COSMOS_MIN_AMOUNT,
  COSMOS_MIN_GAS_LIMIT,
  MIN_AMOUNT,
  MIN_GAS_LIMIT,
  MIN_STAKING_REWARD,
} from '@app/variables/balance';

import {RemoteConfigTypes} from './remote-config.types';

import {getAppVersion} from '../version';

export const REMOTE_CONFIG_DEFAULT_VALUES: Required<RemoteConfigTypes> = {
  proxy_server:
    'https://backend.wallet.production.haqq.network/api/all_networks/jsonrpc',
  cosmos_commission_multilplier: 1.35,
  currency: {
    created_at: '2024-02-12T06:24:48.111998Z',
    icon: '',
    id: 'USD',
    postfix: '',
    prefix: '',
    status: 'unknown',
    title: 'US Dollars',
    updated_at: '2024-02-12T06:24:48.111998Z',
  },
  eth_commission_multilplier: 1.56,
  wallet_connect: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        'personal_sign',
        'eth_sendTransaction',
        'eth_sign',
        'eth_signTransaction',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'wallet_switchEthereumChain',
        'wallet_scanQRCode',
      ],
      events: [
        'chainChanged',
        'accountsChanged',
        'message',
        'disconnect',
        'connect',
      ],
      chains: [
        'eip155:11235',
        'eip155:54211',
        'eip155:1',
        'eip155:10',
        'eip155:56',
        'eip155:137',
        'eip155:42161',
      ],
    },
  },
  web3_app_whitelist: [
    '*.haqq.network',
    '*.muslimgocci.app',
    '*.sushi.com',
    '*.restake.app',
    'https://satellite.money',
    'https://taskon.xyz',
    'https://app.haqq.network',
    'https://haqq.network',
    'https://shell.haqq.network',
    'https://vesting.haqq.network',
    'https://vorobevsa.com',
    'https://metamask.github.io/test-dapp/',
    'https://testedge2.haqq.network',
    'https://app.uniswap.org',
    'https://safe.testedge2.haqq.network',
    'https://chainlist.org/',
    'https://tfm.com',
  ],
  version: getAppVersion(),
  welcome_screen: 'welcomeNews',
  sss_google_provider: 'haqq-google-ios',
  sss_apple_provider: 'haqq-apple',
  sss_custom_provider: IS_DETOX ? 'haqq-custom' : undefined,
  sss_custom_url: IS_DETOX
    ? 'https://haqq-wallet-admin.vercel.app/api/custom/token'
    : undefined,
  sss_metadata_url: 'https://metadata.social.production.haqq.network',
  sss_generate_shares_url:
    'https://generator-shares.social.production.haqq.network',
  airdrop_url: 'https://yaqoot.services.haqq.network',
  airdrop_gasdrop_secret: 'NX2HLGSlACcc2DWSNfVETLr5OzxxTcv5',
  airdrop_gasdrop_campaign_id: '19851c43f2e9da721e0c8356019190b6',
  pattern_source: 'https://storage.googleapis.com/mobile-static/',
  cosmos_min_amount: COSMOS_MIN_AMOUNT,
  cosmos_min_gas_limit: COSMOS_MIN_GAS_LIMIT,
  cosmos_commission_multiplier: BALANCE_MULTIPLIER,
  eth_min_amount: MIN_AMOUNT,
  eth_min_gas_limit: MIN_GAS_LIMIT,
  eth_commission_multiplier: BALANCE_MULTIPLIER,
  transfer_min_amount: MIN_AMOUNT,
  staking_reward_min_amount: MIN_STAKING_REWARD,
  keystone_tutorial_url: 'https://keyst.one/mmm',
  web3_browser_bookmarks: [
    {
      title: 'HAQQ Dashboard',
      url: 'https://shell.haqq.network',
      icon: 'https://haqq.network/assets/media-kit/haqq-sign.png',
    },
    {
      title: 'HAQQ Vesting',
      url: 'https://vesting.haqq.network',
      icon: 'https://vesting.haqq.network/assets/favicon.svg',
    },
    {
      title: 'Sushi',
      url: 'https://www.sushi.com/swap',
      icon: 'https://raw.githubusercontent.com/sushiswap/sushiswap/master/apps/evm/public/icon-512x512.svg',
    },
  ],
  cosmos_explorer: {
    'haqq_11235-1': 'https://ping.pub/haqq/tx/{{tx_hash}}',
    'haqq_54211-3': 'https://testnet.ping.pub/haqq/tx/{{tx_hash}}',
  },
  eth_explorer: {
    'haqq_11235-1': 'https://explorer.haqq.network/tx/{{tx_hash}}',
    'haqq_54211-3': 'https://explorer.testedge2.haqq.network/tx/{{tx_hash}}',
  },
  tx_timestamp_headers: true,
  enable_eth_commission_multiplier: false,
  indexer_sentry_capture_exeption_throttle_ms: 2 * 60 * 1000, // 2 min,
  ws_updates: 'wss://websocket.wallet.testedge2.haqq.network/ws',
  contests_url: '',
  local_captcha_url: '',
  wallet_connect_project_id: Config.WALLET_CONNECT_PROJECT_ID,
  wallet_connect_relay_url: Config.WALLET_CONNECT_RELAY_URL,
};
