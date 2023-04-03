import {
  JsonRpcError,
  JsonRpcRequest,
  createAsyncMiddleware,
} from 'json-rpc-engine';

import {app} from '@app/contexts';
import {AwaitForWalletError, awaitForWallet} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {navigator} from '@app/navigator';
import {EthNetwork} from '@app/services';
import {getAppVersion} from '@app/services/version';

import {Web3BrowserHelper} from './web3-browser-helper';

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
  const selectedAccount = await awaitForWallet(wallets, I18N.selectAccount);
  return selectedAccount;
};

const getEthAccounts = () =>
  Wallet.getAllVisible().map(wallet => wallet.accountId);

export const JsonRpcMethodsHandlers: Record<string, JsonRpcMethodHandler> = {
  metamask_getProviderState: ({helper}) => {
    const user = app.getUser();
    const provider = Provider.getProvider(user.providerId);
    const session = Web3BrowserSession.getByOrigin(helper.origin);
    const chainId = session?.selectedChainIdHex || provider?.ethChainIdHex;
    const networkVersion = Provider.getByChainIdHex(chainId!)?.networkVersion;
    return {
      chainId,
      networkVersion,
      walletName: 'HAQQ Wallet',
      accounts: getEthAccounts(),
      isUnlocked: app.isUnlocked,
    };
  },
  eth_requestAccounts: async ({helper}) => {
    try {
      const user = app.getUser();
      const provider = Provider.getProvider(user.providerId);
      const session = Web3BrowserSession.getByOrigin(helper.origin);
      console.log(
        'SESSION eth_requestAccounts',
        JSON.stringify(session?.toJSON(), null, 2),
      );

      // first connection
      if (!session) {
        const selectedAccount = await requestAccount();

        Web3BrowserSession.create(helper.origin, {
          selectedAccount,
          selectedChainIdHex: provider?.ethChainIdHex,
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
          selectedChainIdHex: provider?.ethChainIdHex,
          disconected: false,
        });
        return [selectedAccount];
      }

      // handle user disconect
      if (session?.selectedAccount && session.disconected) {
        helper.disconnectAccount();
        session.update({
          selectedAccount: '',
          selectedChainIdHex: '',
          disconected: false,
        });
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
  wallet_switchEthereumChain: () => {
    //TODO:
    navigator.navigate('settingsProviders');
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
        console.log(`🔴 JRPC ${req.method} not implemented, ${req.params}`);
        return;
      }

      res.result = await handler({req, helper});
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
