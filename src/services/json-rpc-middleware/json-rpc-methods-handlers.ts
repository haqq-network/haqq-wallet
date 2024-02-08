import EventEmitter from 'events';

import {JsonRpcRequest} from 'json-rpc-engine';
import {Alert} from 'react-native';

import {app} from '@app/contexts';
import {
  AwaitForWalletError,
  awaitForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {
  AwaitProviderError,
  awaitForProvider,
} from '@app/helpers/await-for-provider';
import {
  AwaitForScanQrError,
  QRScannerTypeEnum,
  awaitForScanQr,
} from '@app/helpers/await-for-scan-qr';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {isEthereumChainParams} from '@app/helpers/web3-browser-utils';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {getDefaultNetwork} from '@app/network';
import {getAppVersion} from '@app/services/version';
import {WalletType} from '@app/types';
import {requestQRScannerPermission} from '@app/utils';

export type JsonRpcHelper = EventEmitter & {
  origin: string;
  disconnectAccount(): void;
  changeChainId(ethChainIdHex: string): void;
};

type TJsonRpcRequest = JsonRpcRequest<any>;
type JsonRpcMethodHandlerParams = {
  req: TJsonRpcRequest;
  helper: JsonRpcHelper;
};
type JsonRpcMethodHandler =
  | undefined
  | ((params: JsonRpcMethodHandlerParams) => any);

const rejectJRpcReq = (message: string) => {
  throw {
    message,
    code: -32000,
  };
};

const checkParamsExists = (req: TJsonRpcRequest) => {
  if (!req.params?.[0]) {
    rejectJRpcReq(getText(I18N.jsonRpcErrorInvalidParams));
  }
};

const signTransaction = async ({helper, req}: JsonRpcMethodHandlerParams) => {
  checkParamsExists(req);
  try {
    const session = Web3BrowserSession.getByOrigin(helper.origin);
    const provider = getNetworkProvier(helper);

    if (req.params?.[0]?.gas) {
      req.params[0].gasPrice = req.params[0].gas;
      delete req.params[0].gas;
    }

    const result = await awaitForJsonRpcSign({
      chainId: provider?.ethChainId,
      request: req,
      selectedAccount: session?.selectedAccount,
      metadata: {
        url: helper.origin,
      },
    });
    return result;
  } catch (err) {
    // @ts-ignore
    rejectJRpcReq(err.message);
  }
};

const requestAccount = async ({helper}: JsonRpcMethodHandlerParams) => {
  const wallets = Wallet.getAllVisible();
  const session = Web3BrowserSession.getByOrigin(helper.origin);
  const initialAddress = session?.isActive
    ? session.selectedAccount
    : undefined;

  const selectedAccount = await awaitForWallet({
    wallets,
    title: I18N.selectAccount,
    autoSelectWallet: false,
    initialAddress,
  });
  return selectedAccount;
};

const getEthAccounts = ({helper}: JsonRpcMethodHandlerParams) => {
  const session = Web3BrowserSession.getByOrigin(helper.origin);
  if (session?.isActive) {
    return [session.selectedAccount];
  }
  return [];
};

const getNetworkProvier = (helper: JsonRpcHelper) => {
  // goerli
  // return {
  //   ethChainIdHex: '0x5',
  //   ethChainId: 5,
  //   networkVersion: 5,
  // };
  // ethereum
  // return {
  //   ethChainIdHex: '0x1',
  //   ethChainId: 1,
  //   networkVersion: 1,
  // };

  const session = Web3BrowserSession.getByOrigin(helper.origin);
  let provider: Provider | null;
  if (session?.isActive) {
    provider = Provider.getByChainIdHex(session?.selectedChainIdHex!);
  } else {
    provider = Provider.getById(app.providerId);
  }
  return provider;
};

const getLocalRpcProvider = async (helper: JsonRpcHelper) => {
  const provider = getNetworkProvier(helper);
  return provider ? await getRpcProvider(provider) : getDefaultNetwork();
};

const wrapHexToUint8ArrayString = (hex: string) =>
  `__uint8array__${hex.replace(/^0x/, '')}`;

export const JsonRpcMethodsHandlers: Record<string, JsonRpcMethodHandler> = {
  /* METAMASK ETHEREUM PROVIDER METHODS */
  metamask_getProviderState: ({helper, req}) => {
    const provider = getNetworkProvier(helper);
    return {
      chainId: provider?.ethChainIdHex,
      networkVersion: `${provider?.ethChainId}`,
      accounts: getEthAccounts({helper, req}),
      isUnlocked: app.isUnlocked,
      isHaqqWallet: true,
    };
  },
  eth_requestAccounts: async ({helper, req}) => {
    try {
      const provider = getNetworkProvier(helper);
      const session = Web3BrowserSession.getByOrigin(helper.origin);
      const selectedChainIdHex = provider?.ethChainIdHex;

      // first connection
      if (!session) {
        const selectedAccount = await requestAccount({helper, req});

        Web3BrowserSession.create(helper.origin, {
          selectedAccount,
          selectedChainIdHex,
        });
        return [selectedAccount];
      }

      // get saved account for site
      if (session.selectedAccount && !session?.disconected) {
        session.update({
          onlineAt: new Date(),
        });
        return [session.selectedAccount];
      }

      // login again after disconect
      if (!session.selectedAccount && session?.disconected) {
        const selectedAccount = await requestAccount({helper, req});
        session.update({
          onlineAt: new Date(),
          selectedAccount,
          selectedChainIdHex,
          disconected: false,
        });
        return [selectedAccount];
      }

      // handle user disconect
      if (session?.selectedAccount && session.disconected) {
        helper.disconnectAccount();
        return [];
      }

      return [];
    } catch (err) {
      if (err instanceof AwaitForWalletError) {
        return [];
      }
      if (err instanceof Error) {
        rejectJRpcReq(err.message);
      }
    }
  },
  eth_chainId: ({helper}) => {
    const provider = getNetworkProvier(helper);
    return provider?.ethChainId;
  },
  net_version: ({helper}) => {
    const provider = getNetworkProvier(helper);
    return provider?.networkVersion;
  },
  eth_accounts: getEthAccounts,
  eth_coinbase: getEthAccounts,
  wallet_switchEthereumChain: async ({helper}) => {
    try {
      const providers = Provider.getAll();
      const session = Web3BrowserSession.getByOrigin(helper.origin);

      const initialProviderId = Provider.getByChainIdHex(
        session?.selectedChainIdHex!,
      )?.id;

      const providerId = await awaitForProvider({
        providers,
        initialProviderId: initialProviderId!,
        title: I18N.networks,
      });

      const selectedProvider = Provider.getById(providerId!);
      session?.update({
        selectedChainIdHex: selectedProvider?.ethChainIdHex,
      });
      helper.changeChainId(selectedProvider?.ethChainIdHex!);
    } catch (err) {
      if (err instanceof AwaitProviderError) {
        return rejectJRpcReq(err.message!);
      }
    }
    return null;
  },
  eth_hashrate: () => '0x00',
  eth_getBlockByNumber: async ({req, helper}) => {
    checkParamsExists(req);
    const rpcProvider = await getLocalRpcProvider(helper);
    return await rpcProvider.getBlock(req.params?.[0]);
  },
  eth_getBlock: async ({req, helper}) => {
    checkParamsExists(req);
    const rpcProvider = await getLocalRpcProvider(helper);
    return await rpcProvider.getBlock(req.params?.[0]);
  },
  eth_call: async ({req, helper}) => {
    checkParamsExists(req);
    try {
      const rpcProvider = await getLocalRpcProvider(helper);
      return await rpcProvider.call(req.params[0], req.params[1]);
    } catch (err) {
      if (err instanceof Error) {
        rejectJRpcReq(err.message);
      }
    }
  },
  eth_getTransactionCount: async ({req, helper}) => {
    checkParamsExists(req);
    try {
      const rpcProvider = await getLocalRpcProvider(helper);
      return rpcProvider.getTransactionCount(req.params[0], req.params[1]);
    } catch (err) {
      if (err instanceof Error) {
        rejectJRpcReq(err.message);
      }
    }
  },
  eth_mining: () => false,
  net_listening: () => true,
  eth_estimateGas: async ({req, helper}) => {
    checkParamsExists(req);
    try {
      const rpcProvider = await getLocalRpcProvider(helper);
      return (await rpcProvider.estimateGas(req.params[0]))?._hex;
    } catch (err) {
      if (err instanceof Error) {
        rejectJRpcReq(err.message);
      }
    }
  },
  web3_clientVersion: async () => {
    const appVersion = getAppVersion();
    return `HAQQ/${appVersion}/Wallet`;
  },
  eth_getCode: async ({req, helper}) => {
    checkParamsExists(req);
    try {
      const rpcProvider = await getLocalRpcProvider(helper);
      return await rpcProvider.getCode(req.params[0], req.params[1]);
    } catch (err) {
      if (err instanceof Error) {
        rejectJRpcReq(err.message);
      }
    }
  },
  eth_blockNumber: async ({helper}) => {
    try {
      const rpcProvider = await getLocalRpcProvider(helper);
      return rpcProvider.blockNumber;
    } catch (err) {
      if (err instanceof Error) {
        rejectJRpcReq(err.message);
      }
    }
  },
  eth_getTransactionByHash: async ({req, helper}) => {
    checkParamsExists(req);
    try {
      const rpcProvider = await getLocalRpcProvider(helper);
      return await rpcProvider.getTransaction(req.params?.[0]);
    } catch (err) {
      if (err instanceof Error) {
        rejectJRpcReq(err.message);
      }
    }
  },
  eth_getTransactionReceipt: async ({req, helper}) => {
    checkParamsExists(req);
    try {
      const rpcProvider = await getLocalRpcProvider(helper);
      return await rpcProvider.getTransactionReceipt(req.params?.[0]);
    } catch (err) {
      if (err instanceof Error) {
        rejectJRpcReq(err.message);
      }
    }
  },
  eth_sendTransaction: signTransaction,
  eth_sign: signTransaction,
  personal_sign: signTransaction,
  eth_signTypedData: signTransaction,
  eth_signTypedData_v3: signTransaction,
  eth_signTypedData_v4: signTransaction,
  wallet_addEthereumChain: ({req}) => {
    checkParamsExists(req);
    const chainInfo = req.params?.[0];
    if (isEthereumChainParams(chainInfo)) {
      Logger.log('wallet_addEthereumChain', chainInfo?.chainName);
    }
  },
  wallet_scanQRCode: async ({req, helper}) => {
    const pattern = req.params?.[0] as string;

    if (!!pattern && typeof pattern !== 'string') {
      rejectJRpcReq(getText(I18N.jsonRpcErrorInvalidParams));
    }

    try {
      const isAccesGranted = await requestQRScannerPermission(helper.origin);

      if (!isAccesGranted) {
        rejectJRpcReq(AwaitForScanQrError.getCameraPermissionError().message!);
      }

      return await awaitForScanQr({pattern, variant: QRScannerTypeEnum.qr});
    } catch (err) {
      if (err instanceof Error) {
        rejectJRpcReq(err.message);
      }
    }
  },
  eth_gasPrice: async ({helper}) => {
    const rpcProvider = await getLocalRpcProvider(helper);
    return rpcProvider.getGasPrice();
  },
  /* HAQQ KEPLR COSMOS PROVIDER METHODS */
  enable: async ({req, helper}) => {
    const session = Web3BrowserSession.getByOrigin(helper.origin);

    if (!session || session?.disconected === true) {
      // TODO: add cosmos chain recognition and filter connection
      // TODO: create design for approve connection
      const chains = req.params as string[];
      const approved = await new Promise<boolean>(resolve => {
        Alert.alert(
          'Approve connection',
          `allow connect this website to chains: "${chains.join(', ')}"`,
          [
            {
              text: getText(I18N.cancel),
              onPress: () => resolve(false),
              style: 'cancel',
            },
            {
              text: getText(I18N.accept),
              onPress: () => resolve(true),
            },
          ],
          {cancelable: false},
        );
      });

      if (!approved) {
        rejectJRpcReq('user rejected');
      }
    }

    return true;
  },
  disable: async ({helper}) => {
    helper.disconnectAccount();
  },
  getKey: async ({req, helper}) => {
    const [address] = await JsonRpcMethodsHandlers.eth_requestAccounts?.({
      helper,
      req,
    });

    const wallet = Wallet.getById(address);
    if (wallet) {
      const walletProvider = await getProviderInstanceForWallet(wallet);
      const {publicKey} = await walletProvider.getAccountInfo(wallet.path!);

      return {
        name: wallet.name,
        algo: 'ethsecp256k1',
        pubKey: wrapHexToUint8ArrayString(publicKey),
        address: wrapHexToUint8ArrayString(address),
        bech32Address: AddressUtils.toHaqq(address),
        isNanoLedger: wallet.type === WalletType.ledgerBt,
        isKeystone: wallet.type === WalletType.keystone,
      };
    }

    return undefined;
  },
  signAmino: () => rejectJRpcReq('signAmino not implemented'),
  signDirect: () => rejectJRpcReq('signDirect not implemented'),
  sendTx: () => rejectJRpcReq('sendTx not implemented'),
  signArbitrary: () => rejectJRpcReq('signArbitrary not implemented'),
  verifyArbitrary: () => rejectJRpcReq('verifyArbitrary not implemented'),
  signEthereum: () => rejectJRpcReq('signEthereum not implemented'),
  experimentalSuggestChain: () =>
    rejectJRpcReq('experimentalSuggestChain not implemented'),
};
