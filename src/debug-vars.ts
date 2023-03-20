interface DebugVars {
  enableSentry: boolean;
  enableWalletConnectLogger: boolean;
  enableCaptchaLogger: boolean;
  enableSkipPinOnLogin: boolean;
}

const production: DebugVars = {
  enableSentry: true,
  enableWalletConnectLogger: false,
  enableCaptchaLogger: false,
  enableSkipPinOnLogin: false,
};

const debug: DebugVars = {
  enableSentry: !__DEV__,
  enableWalletConnectLogger: false,
  enableCaptchaLogger: __DEV__,
  enableSkipPinOnLogin: false, //__DEV__,
};

export const DEBUG_VARS = __DEV__ ? debug : production;
