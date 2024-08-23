import {WalletAddress} from './types';

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
  mockWalletsAddresses: WalletAddress[];
  hardcodeERC20TokensContract: Record<number, string[]>;
  enableHardcodeERC20TokensContract: boolean;
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
  enableHardcodeERC20TokensContract: false,
  hardcodeERC20TokensContract: {
    // TestEdge2
    54211: [
      '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75', // AXL
      '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd', // axlUSDC
      '0x3452e23F9c4cC62c70B7ADAd699B264AF3549C19', // axlUSDC from axelar faucet
      '0x5db67696C3c088DfBf588d3dd849f44266ff0ffa', // AXL from axelar faucet
    ],
    // Mainnet
    11235: [
      '0xC5e00D3b04563950941f7137B5AfA3a534F0D6d6', // axlDAI
      '0xc03345448969Dd8C00e9E4A85d2d9722d093aF8E', // OSMO
      '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd', // axlUSDC
      '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75', // axlUSDT
      '0xFA3C22C069B9556A4B2f7EcE1Ee3B467909f4864', // ATOM
      '0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687', // axlWBTC
      '0x0CE35b0D42608Ca54Eb7bcc8044f7087C18E7717', // USDC
      '0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265', // axlWETH
      '0x1D54EcB8583Ca25895c512A8308389fFD581F9c9', // AXL
      '0x5aD523d94Efb56C400941eb6F34393b84c75ba39', // USDT on Kava
    ],
  },
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
  ],
  enableHardcodeERC20TokensContract: false,
  hardcodeERC20TokensContract: {
    // TestEdge2
    54211: [
      '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75', // AXL
      '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd', // axlUSDC
      '0x3452e23F9c4cC62c70B7ADAd699B264AF3549C19', // axlUSDC from axelar faucet
      '0x5db67696C3c088DfBf588d3dd849f44266ff0ffa', // AXL from axelar faucet
    ],
    // Mainnet
    11235: [
      '0xC5e00D3b04563950941f7137B5AfA3a534F0D6d6', // axlDAI
      '0xc03345448969Dd8C00e9E4A85d2d9722d093aF8E', // OSMO
      '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd', // axlUSDC
      '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75', // axlUSDT
      '0xFA3C22C069B9556A4B2f7EcE1Ee3B467909f4864', // ATOM
      '0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687', // axlWBTC
      '0x0CE35b0D42608Ca54Eb7bcc8044f7087C18E7717', // USDC
      '0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265', // axlWETH
      '0x1D54EcB8583Ca25895c512A8308389fFD581F9c9', // AXL
      '0x5aD523d94Efb56C400941eb6F34393b84c75ba39', // USDT on Kava
    ],
    1: [
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    ],
  },
};

export const DEBUG_VARS = __DEV__ ? debug : production;
