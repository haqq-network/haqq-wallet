declare module 'react-native-config' {
  export interface NativeConfig {
    POSTHOG_API_KEY: string;
    POSTHOG_HOST: string;
    PROVIDER_NETWORK: string;
    PROVIDER_CHAIN_ID: string;
    SENTRY_DSN: string;
    PATTERNS_SOURCE: string;
    ENVIRONMENT: string;
    IS_DEVELOPMENT: string;
    WALLET_CONNECT_PROJECT_ID: string;
    WALLET_CONNECT_RELAY_URL: string;
    HCAPTCHA_SITE_KEY: string;
    HCAPTCHA_URL: string;
    GOOGLE_SIGNIN_WEB_CLIENT_ID: string;
    METADATA_URL: string;
    GENERATE_SHARES_URL: string;
    IS_SSS_ENABLED: string;
    IS_NFT_ENABLED: string;
    AIRDROP_MAINNET_URL: string;
    HAQQ_BACKEND: string;
    HAQQ_BACKEND_DEV: string;
    HAQQ_BACKEND_DEFAULT: string;

    ADJUST_TOKEN: string;
    ADJUST_ENVIRONMENT: 'sandbox' | 'production';
    AIRDROP_GASDROP_SECRET: string;
    AIRDROP_GASDROP_CAMPAIGN_ID: string;
    GOOGLE_PLAY_PACKAGE: string;
    APPSTORE_APP_ID: string;
    // https://dash.cloudflare.com/login
    TURNSTILE_URL: string;
    TURNSTILE_SITEKEY: string;
    // https://www.google.com/recaptcha/admin/create
    RECAPTCHA_V2_URL: string;
    RECAPTCHA_V2_SITEKEY: string;
    MMKV_KEY: string;
    FOR_DETOX: boolean;
    STORIES_ENABLED: boolean;
    DETOX_MILK_PRIVATE_KEY: string;
    DETOX_PROVIDER: string;
    DETOX_CHAIN_ID: string;

    APP_VERSION: string;
    LOCALIZE_KEY: string;
    LOCALISE_PROJECT_ID: string;
  }

  export const Config: NativeConfig;
  // eslint-disable-next-line import/no-default-export
  export default Config;
}
