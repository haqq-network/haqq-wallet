import {getDefaultBalanceValue} from '@app/helpers/get-remote-balance-value';

import {RemoteConfigTypes} from './remote-config-types';

import {getAppVersion} from '../version';

export const REMOTE_CONFIG_DEFAULT_VALUES: Required<RemoteConfigTypes> = {
  wallet_connect: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        'personal_sign',
        'eth_sendTransaction',
        'personal_sign',
        'eth_accounts',
        'eth_requestAccounts',
        'eth_call',
        'eth_getBalance',
        'eth_sendRawTransaction',
        'eth_sign',
        'eth_signTransaction',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain',
        'wallet_getPermissions',
        'wallet_requestPermissions',
        'wallet_registerOnboarding',
        'wallet_watchAsset',
        'wallet_scanQRCode',
      ],
      events: [
        'chainChanged',
        'accountsChanged',
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
  evm_endpoints: {
    'haqq_54211-3': [
      'https://rpc.eth.testedge2.haqq.network',
      'https://te2-s1-evm-rpc.haqq.sh',
    ],
    'haqq_11235-1': [
      'https://rpc.eth.haqq.network',
      'https://m-s1-evm-rpc.haqq.sh',
    ],
  },
  tm_endpoints: {
    'haqq_11235-1': ['https://rpc.tm.haqq.network', 'https://m-s1-tm.haqq.sh'],
    'haqq_54211-3': [
      'https://rpc.tm.testedge2.haqq.network',
      'https://te2-s1-tm.haqq.sh',
    ],
  },
  indexer_endpoints: {
    'haqq_11235-1': 'https://jsonrpc.indexer.haqq.network',
    'haqq_54211-3': 'https://jsonrpc.indexer.testedge2.haqq.network',
  },
  app_version: getAppVersion(),
  ios_version: getAppVersion(),
  android_version: getAppVersion(),
  welcome_screen: 'welcomeNews',
  sss_google: 'haqq-google-ios',
  sss_apple: 'haqq-apple',
  sss_custom: undefined,
  sss_custom_url: undefined,
  sss_metadata_url: 'https://metadata.social.production.haqq.network',
  sss_generate_shares_url:
    'https://generator-shares.social.production.haqq.network',
  airdrop_url: 'https://yaqoot.services.haqq.network',
  airdrop_gasdrop_secret: 'NX2HLGSlACcc2DWSNfVETLr5OzxxTcv5',
  airdrop_gasdrop_campaign_id: '19851c43f2e9da721e0c8356019190b6',
  pattern_source: 'https://storage.googleapis.com/mobile-static/',
  version: 1,
  cosmos_min_amount: getDefaultBalanceValue('cosmos_min_amount').toHex(),
  cosmos_min_gas_limit: getDefaultBalanceValue('cosmos_min_gas_limit').toHex(),
  eth_min_amount: getDefaultBalanceValue('eth_min_amount').toHex(),
  eth_min_gas_limit: getDefaultBalanceValue('eth_min_gas_limit').toHex(),
  transfer_min_amount: getDefaultBalanceValue('transfer_min_amount').toHex(),
  staking_reward_min_amount: getDefaultBalanceValue(
    'staking_reward_min_amount',
  ).toHex(),
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
};
