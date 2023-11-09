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
  enableMockWallets: boolean;
  mockWalletsAddresses: string[];
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
  enableMockWallets: false,
  mockWalletsAddresses: [],
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
  enableMockWallets: true,
  mockWalletsAddresses: [
    '0x65221cede3abdd03e377e3a4ce84e14fcd497919',
    '0x98ed1f5d1e0ca514c390b7e08cbb8d769fc87ac5',
  ],
};

export const DEBUG_VARS = __DEV__ ? debug : production;
