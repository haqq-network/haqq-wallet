import {JsonRpcRequest} from 'json-rpc-engine';

import {Web3BrowserHelper} from '@app/components/web3-browser/web3-browser-helper';
import {app} from '@app/contexts';
import {AwaitForWalletError, awaitForWallet} from '@app/helpers';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {
  AwaitProviderError,
  awaitForProvider,
} from '@app/helpers/await-for-provider';
import {isEthereumChainParams} from '@app/helpers/web3-browser-utils';
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

const rejectJsonRpcRequest = (message: string) => {
  throw {
    message,
    code: -32000,
  };
};

const signTransaction = async ({helper, req}: JsonRpcMethodHandlerParams) => {
  try {
    const session = Web3BrowserSession.getByOrigin(helper.origin);
    const provider = getNetworkProvier(helper);
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
    rejectJsonRpcRequest(err.message);
  }
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

const getNetworkProvier = (helper: Web3BrowserHelper) => {
  // goerli
  // return {
  //   ethChainIdHex: '0x5',
  //   ethChainId: 5,
  //   networkVersion: 5,
  // };

  const user = app.getUser();
  const session = Web3BrowserSession.getByOrigin(helper.origin);
  let provider: Provider | null;
  if (session?.isActive) {
    provider = Provider.getByChainIdHex(session?.selectedChainIdHex!);
  } else {
    provider = Provider.getProvider(user.providerId);
  }
  return provider;
};

export const JsonRpcMethodsHandlers: Record<string, JsonRpcMethodHandler> = {
  metamask_getProviderState: ({helper, req}) => {
    const provider = getNetworkProvier(helper);
    return {
      chainId: provider?.ethChainIdHex,
      networkVersion: provider?.networkVersion,
      accounts: getEthAccounts({helper, req}),
      isUnlocked: app.isUnlocked,
    };
  },
  eth_requestAccounts: async ({helper}) => {
    try {
      const provider = getNetworkProvier(helper);
      const session = Web3BrowserSession.getByOrigin(helper.origin);
      const selectedChainIdHex = provider?.ethChainIdHex;

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
  eth_hashrate: () => '0x00',
  eth_getBlockByNumber: () => 0,
  eth_call: () => 1,
  eth_mining: () => false,
  net_listening: () => true,
  web3_clientVersion: async () => {
    const appVersion = getAppVersion();
    return `HAQQ/${appVersion}/Wallet`;
  },
  eth_getCode: async ({req}) => {
    try {
      return await EthNetwork.network.getCode(req.params[0], req.params[1]);
    } catch (err) {
      if (err instanceof Error) {
        rejectJsonRpcRequest(err.message);
      }
    }
  },
  eth_blockNumber: () => {
    return EthNetwork.network.blockNumber;
  },
  eth_sendTransaction: signTransaction,
  eth_sign: signTransaction,
  personal_sign: signTransaction,
  eth_signTypedData_v3: signTransaction,
  eth_signTypedData: signTransaction,
  eth_signTypedData_v4: signTransaction,
  wallet_addEthereumChain: ({req}) => {
    const chainInfo = req.params?.[0];
    if (isEthereumChainParams(chainInfo)) {
      console.log('wallet_addEthereumChain', chainInfo?.chainName);
    }
  },
};
