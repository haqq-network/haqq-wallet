interface DebugVars {
  enableAwaitJsonRpcSignLogger: boolean;
  enableAsyncEventEmitterLogs: boolean;
  enableHttpErrorDetails: any;
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
  enableWalletConnectLogger: true,
  enableCaptchaLogger: false,
  enableSkipPinOnLogin: false,
  enableWeb3BrowserLogger: false,
  allowAnySourcesForWalletConnectLogin: false,
  disableWeb3DomainBlocking: false,
  enableHttpErrorDetails: false,
  enableAwaitJsonRpcSignLogger: false,
  enableAsyncEventEmitterLogs: true,
};

const debug: DebugVars = {
  enableSentry: false,
  enableWeb3BrowserIncognito: false,
  enableWalletConnectLogger: false,
  enableCaptchaLogger: true,
  enableSkipPinOnLogin: false,
  enableWeb3BrowserLogger: true,
  allowAnySourcesForWalletConnectLogin: true,
  disableWeb3DomainBlocking: true,
  enableHttpErrorDetails: true,
  enableAsyncEventEmitterLogs: false,
  enableAwaitJsonRpcSignLogger: true,
};

export const DEBUG_VARS = __DEV__ ? debug : production;
