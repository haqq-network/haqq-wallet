interface DebugVars {
  enableSentry: boolean;
  enableWalletConnectLogger: boolean;
  enableCaptchaLogger: boolean;
  enableSkipPinOnLogin: boolean;
  enableWeb3BrowserLogger: boolean;
}

const production: DebugVars = {
  enableSentry: true,
  enableWalletConnectLogger: false,
  enableCaptchaLogger: false,
  enableSkipPinOnLogin: false,
  enableWeb3BrowserLogger: false,
};

const debug: DebugVars = {
  enableSentry: !__DEV__,
  enableWalletConnectLogger: false,
  enableCaptchaLogger: __DEV__,
  enableSkipPinOnLogin: __DEV__,
  enableWeb3BrowserLogger: true,
};

export const DEBUG_VARS = __DEV__ ? debug : production;
