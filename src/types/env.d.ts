declare module 'react-native-config' {
  export interface NativeConfig {
    // Default chain provider configuration
    PROVIDER_NETWORK: string; // Network URL for provider
    PROVIDER_CHAIN_ID: string; // Chain ID for provider network

    // Wallet Connect Configuration
    WALLET_CONNECT_PROJECT_ID: string; // Project ID for Wallet Connect
    WALLET_CONNECT_RELAY_URL: string; // Relay URL for Wallet Connect

    GOOGLE_SIGNIN_WEB_CLIENT_ID: string; // Web client ID for Google Sign-In

    // HAQQ Backend Configuration
    HAQQ_BACKEND: string; // Production URL for HAQQ backend
    HAQQ_BACKEND_DEV: string; // Development URL for HAQQ backend

    // App ids Configuration
    GOOGLE_PLAY_PACKAGE: string; // Package name for Google Play store
    APPSTORE_APP_ID: string; // App ID for Apple App Store

    // CAPTCHA Configuration
    TURNSTILE_URL: string; // Turnstile service URL for CAPTCHA
    TURNSTILE_SITEKEY: string; // Site key for Turnstile CAPTCHA
    RECAPTCHA_V2_URL: string; // URL for Google reCAPTCHA V2
    RECAPTCHA_V2_SITEKEY: string; // Site key for Google reCAPTCHA V2
    HCAPTCHA_SITE_KEY: string; // Public key for hCaptcha
    HCAPTCHA_URL: string; // hCaptcha service URL

    // End-to-End Testing Configuration
    FOR_DETOX: boolean; // Flag to enable Detox for E2E tests
    DETOX_MILK_PRIVATE_KEY: string; // Private key for Detox's Milk
    DETOX_PROVIDER: string; // Provider URL for Detox
    DETOX_CHAIN_ID: string; // Chain ID for Detox

    // Other
    MMKV_KEY: string; // Encryption key for MMKV storage
    STORIES_ENABLED: boolean; // Flag to enable Stories feature
    ENVIRONMENT: string; // Application environment
    IS_DEVELOPMENT: string; // Flag indicating if the app is in development
    APP_VERSION: string; // Current version of the app
    POSTHOG_API_KEY: string; // API key for PostHog
    POSTHOG_HOST: string; // Host URL for PostHog
    SENTRY_DSN: string; // DSN for Sentry error tracking
    ADJUST_TOKEN: string; // Token for Adjust integration
    ADJUST_ENVIRONMENT: 'sandbox' | 'production'; // Environment for Adjust
  }

  export const Config: NativeConfig;
  // eslint-disable-next-line import/no-default-export
  export default Config;
}
