import {
  JsonRpcError,
  JsonRpcRequest,
  createAsyncMiddleware,
} from 'json-rpc-engine';

import {WebViewEventsEnum} from '@app/components/web3-browser/scripts';
import {Web3BrowserHelper} from '@app/components/web3-browser/web3-browser-helper';
import {app} from '@app/contexts';
import {AwaitForWalletError, awaitForWallet} from '@app/helpers';
import {
  AwaitProviderError,
  awaitForProvider,
} from '@app/helpers/await-for-provider';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {EthNetwork} from '@app/services';
import {getAppVersion} from '@app/services/version';

type TJsonRpcRequest = JsonRpcRequest<any>;
type JsonRpcMethodHandlerParams = {
  req: TJsonRpcRequest;
  helper: Web3BrowserHelper;
};
type JsonRpcMethodHandler =
  | undefined
  | ((params: JsonRpcMethodHandlerParams) => any);
type CreateJsonRpcMiddlewareParams = {
  helper: Web3BrowserHelper;
  // if in the engine has less than one middleware `next` method is crash app
  useNext?: boolean;
};

const rejectJsonRpcRequest = (message: string) => {
  throw {
    message,
    code: -32000,
  };
};

const requestAccount = async () => {
  const wallets = Wallet.getAllVisible();
  const selectedAccount = await awaitForWallet({
    wallets,
    title: I18N.selectAccount,
    autoSelectWallet: false,
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

export const JsonRpcMethodsHandlers: Record<string, JsonRpcMethodHandler> = {
  metamask_getProviderState: ({helper, req}) => {
    const user = app.getUser();
    const provider = Provider.getProvider(user.providerId);
    const session = Web3BrowserSession.getByOrigin(helper.origin);
    const chainId = session?.selectedChainIdHex || provider?.ethChainIdHex;
    const networkVersion = Provider.getByChainIdHex(chainId!)?.networkVersion;
    return {
      chainId,
      networkVersion,
      accounts: getEthAccounts({helper, req}),
      isUnlocked: app.isUnlocked,
    };
  },
  eth_requestAccounts: async ({helper}) => {
    try {
      const user = app.getUser();
      const provider = Provider.getProvider(user.providerId);
      const session = Web3BrowserSession.getByOrigin(helper.origin);
      const selectedChainIdHex =
        session?.selectedChainIdHex || provider?.ethChainIdHex;

      // first connection
      if (!session) {
        const selectedAccount = await requestAccount();

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
        const selectedAccount = await requestAccount();
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
        rejectJsonRpcRequest(err.message);
      }
    }
  },
  eth_chainId: ({helper}) => {
    const session = Web3BrowserSession.getByOrigin(helper.origin);
    const user = app.getUser();
    let provider: Provider | null;

    if (session?.isActive) {
      provider = Provider.getByChainIdHex(session?.selectedChainIdHex!);
    } else {
      provider = Provider.getProvider(user.providerId);
    }

    return provider?.ethChainId;
  },
  eth_accounts: getEthAccounts,
  eth_coinbase: getEthAccounts,
  wallet_switchEthereumChain: async ({helper}) => {
    try {
      const providers = Provider.getProviders();
      const session = Web3BrowserSession.getByOrigin(helper.origin);

      const initialProviderId = Provider.getByChainIdHex(
        session?.selectedChainIdHex!,
      )?.id;

      const providerId = await awaitForProvider({
        providers,
        initialProviderId: initialProviderId!,
        title: I18N.networks,
      });

      const selectedProvider = Provider.getProvider(providerId!);
      session?.update({
        selectedChainIdHex: selectedProvider?.ethChainIdHex,
      });
      helper.changeChainId(selectedProvider?.ethChainIdHex!);
    } catch (err) {
      if (err instanceof AwaitProviderError) {
        return rejectJsonRpcRequest(err.message!);
      }
    }
    return null;
  },
  eth_hashrate: () => {
    return '0x00';
  },
  eth_mining: () => {
    return false;
  },
  net_listening: () => {
    return true;
  },
  web3_clientVersion: async () => {
    const appVersion = getAppVersion();
    return `HAQQ/${appVersion}/Wallet`;
  },
  eth_blockNumber: () => {
    return EthNetwork.network.blockNumber;
  },
  net_version: ({helper}) => {
    const user = app.getUser();
    const provider = Provider.getProvider(user.providerId);
    const session = Web3BrowserSession.getByOrigin(helper.origin);
    const chainId = session?.selectedChainIdHex || provider?.ethChainIdHex;
    const networkVersion = Provider.getByChainIdHex(chainId!)?.networkVersion;
    return networkVersion;
  },
};

export const createJsonRpcMiddleware = ({
  helper,
  useNext,
}: CreateJsonRpcMiddlewareParams) => {
  return createAsyncMiddleware(async (req, res, next) => {
    try {
      const handler = JsonRpcMethodsHandlers[req.method];

      if (!handler) {
        res.error = {
          code: -32601,
          message: 'Method not implemented',
        };
        console.log(
          `🔴 JRPC ${req.method} not implemented, params:`,
          JSON.stringify(req.params),
        );
        return;
      }

      res.result = await handler({req, helper});

      if (req.method === 'eth_requestAccounts' && Array.isArray(res.result)) {
        helper.emit(WebViewEventsEnum.ACCOUNTS_CHANGED, [...res.result]);
      }
    } catch (err) {
      // @ts-ignore
      if (typeof err.code === 'number' && typeof err.message === 'string') {
        res.error = err as JsonRpcError;
      } else {
        console.error('🔴 json rpc middleware error', req, err);
      }
    }

    // if in the engine has less than one middleware then this is crash app
    if (useNext) {
      await next();
    }
  });
};

export const createJsonRpcLoggerMiddleWare = () => {
  return createAsyncMiddleware(async (req, res) => {
    console.log(
      `🟣 JRPC ${req.id} ${req.method} \nPARAMS:  ${JSON.stringify(
        req.params || '{}',
        null,
        2,
      )}\nRESULT: ${JSON.stringify(res.result || res.error || '{}', null, 2)}
        `,
    );
  });
};
