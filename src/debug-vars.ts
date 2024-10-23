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
  enableKeystoneMockSync: boolean;
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
  enableKeystoneMockSync: false,
};

const debug: DebugVars = {
  enableSentry: false,
  enableWeb3BrowserIncognito: false,
  enableWalletConnectLogger: false,
  enableCaptchaLogger: true,
  enableSkipPinOnLogin: false,
  enableWeb3BrowserLogger: true,
  allowAnySourcesForWalletConnectLogin: true,
  disableWeb3DomainBlocking: false,
  enableHttpErrorDetails: true,
  enableAsyncEventEmitterLogs: false,
  enableAwaitJsonRpcSignLogger: true,
  enableMockWallets: false,
  mockWalletsAddresses: [
    '0xa69babef1ca67a37ffaf7a485dfff3382056e78c',
    '0x887Fa9cd8427eF96aFB5376a60Ceb8904514bBe9',
    '0x65221cede3abdd03e377e3a4ce84e14fcd497919',
    '0x98ed1f5d1e0ca514c390b7e08cbb8d769fc87ac5',
    '0xbe4cc5565a43e34489d2f02ed9680b436e596383',
    '0x4c794408a9929918193e9160287d58f6d3bc772a',
    '0x81fd1c90d2d3356a131c5c60d7bf8ce263671cc9',
    '0x6bfc630da6d0e1ab0053d236c0d6c7702c0c0cc0',
    '0x1ae9970e3c9955134cf1c42803ce48fa9c661015',
  ],
  enableKeystoneMockSync: true,
};

export const DEBUG_VARS = __DEV__ ? debug : production;
