interface DebugVars {
  enableSentry: boolean;
  enableWalletConnectLogger: boolean;
  enableWeb3BrowserIncognito: boolean;
  enableCaptchaLogger: boolean;
  enableSkipPinOnLogin: boolean;
  enableWeb3BrowserLogger: boolean;
  allowAnySourcesForWalletConnectLogin: boolean;
  disableWeb3DomainBlocking: boolean;
}

const production: DebugVars = {
  enableSentry: true,
  enableWeb3BrowserIncognito: false,
  enableWalletConnectLogger: false,
  enableCaptchaLogger: false,
  enableSkipPinOnLogin: false,
  enableWeb3BrowserLogger: false,
  allowAnySourcesForWalletConnectLogin: false,
  disableWeb3DomainBlocking: false,
};

const debug: DebugVars = {
  enableSentry: !__DEV__,
  enableWeb3BrowserIncognito: false,
  enableWalletConnectLogger: false,
  enableCaptchaLogger: __DEV__,
  enableSkipPinOnLogin: false,
  enableWeb3BrowserLogger: true,
  allowAnySourcesForWalletConnectLogin: false,
  disableWeb3DomainBlocking: false,
};

export const DEBUG_VARS = __DEV__ ? debug : production;
