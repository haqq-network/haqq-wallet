import {ProviderInterface} from '@haqq/rn-wallet-providers';

import {AppStore} from '@app/models/app';
import {Provider} from '@app/models/provider';
import {EventTracker} from '@app/services/event-tracker';
import {TransactionRpcStore} from '@app/services/rpc/evm-transaction';
import {MarketingEvents} from '@app/types';

/**
 * Wrap provider method to track events
 * does not catch sensitive data
 * @param provider
 * @param methodName
 */
function wrapProviderMethod<TMethodName extends keyof ProviderInterface>(
  provider: ProviderInterface,
  methodName: TMethodName,
) {
  const originalMethod = provider[methodName]?.bind(provider);
  const logger = Logger.create(provider.constructor.name, {
    emodjiPrefix: '🟡',
    enabled: __DEV__,
    stringifyJson: true,
  });
  const wrappedMethod = async function (...args: any[]) {
    logger.log('start', methodName, args);
    const params = {
      type: methodName as string,
      network: Provider.selectedProvider.name,
      chainId: `${Provider.selectedProvider.ethChainId}`,
    };
    try {
      EventTracker.instance.trackEvent(MarketingEvents.signTxStart, params);
      // @ts-ignore
      const result = await originalMethod?.(...args);
      const wallet = await provider.getAccountInfo(args[0]);
      EventTracker.instance.trackEvent(MarketingEvents.signTxSuccess, {
        ...wallet,
        ...params,
      });
      logger.log('success', methodName, result);
      if (AppStore.isRpcOnly) {
        TransactionRpcStore.getInstance().reset();
      }
      return result;
    } catch (error) {
      logger.error('error', methodName, error);
      EventTracker.instance.trackEvent(MarketingEvents.signTxFail, params);
      throw error;
    }
  };
  return wrappedMethod as ProviderInterface[TMethodName];
}

export function wrapWalletProvider(
  provider: ProviderInterface,
): ProviderInterface {
  const wrapped = {
    signTransaction: wrapProviderMethod(provider, 'signTransaction'),
    signPersonalMessage: wrapProviderMethod(provider, 'signPersonalMessage'),
    signTypedData: wrapProviderMethod(provider, 'signTypedData'),
  };

  return Object.assign(provider, wrapped);
}
