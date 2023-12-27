declare module '@env' {
  export const PROVIDER_NETWORK: string;
  export const PROVIDER_CHAIN_ID: string;
  export const SENTRY_DSN: string;
  export const PATTERNS_SOURCE: string;
  export const ENVIRONMENT: string;
  export const IS_DEVELOPMENT: string;
  export const WALLET_CONNECT_PROJECT_ID: string;
  export const WALLET_CONNECT_RELAY_URL: string;
  export const HCAPTCHA_SITE_KEY: string;
  export const HCAPTCHA_URL: string;
  export const GOOGLE_SIGNIN_WEB_CLIENT_ID: string;
  export const METADATA_URL: string;
  export const GENERATE_SHARES_URL: string;
  export const IS_SSS_ENABLED: string;
  export const AIRDROP_MAINNET_URL: string;
  export const HAQQ_BACKEND: string;
  export const HAQQ_BACKEND_DEV: string;

  export const ADJUST_TOKEN: string;
  export const ADJUST_ENVIRONMENT: 'sandbox' | 'production';
  export const AIRDROP_GASDROP_SECRET: string;
  export const AIRDROP_GASDROP_CAMPAIGN_ID: string;
  export const GOOGLE_PLAY_PACKAGE: string;
  export const APPSTORE_APP_ID: string;
  // https://dash.cloudflare.com/login
  export const TURNSTILE_URL: string;
  export const TURNSTILE_SITEKEY: string;
  // https://www.google.com/recaptcha/admin/create
  export const RECAPTCHA_V2_URL: string;
  export const RECAPTCHA_V2_SITEKEY: string;
  export const MMKV_KEY: string;
  export const FOR_DETOX: boolean;
}
