interface DebugVars {
  enableSentry: boolean;
  enableWalletConnectLogger: boolean;
  enableWeb3BrowserIncognito: boolean;
  enableCaptchaLogger: boolean;
  enableSkipPinOnLogin: boolean;
  enableWeb3BrowserLogger: boolean;
}

const production: DebugVars = {
  enableSentry: true,
  enableWeb3BrowserIncognito: false,
  enableWalletConnectLogger: false,
  enableCaptchaLogger: false,
  enableSkipPinOnLogin: false,
  enableWeb3BrowserLogger: false,
};

const debug: DebugVars = {
  enableSentry: !__DEV__,
  enableWeb3BrowserIncognito: false,
  enableWalletConnectLogger: false,
  enableCaptchaLogger: __DEV__,
  enableSkipPinOnLogin: __DEV__,
  enableWeb3BrowserLogger: __DEV__,
};

export const DEBUG_VARS = __DEV__ ? debug : production;
