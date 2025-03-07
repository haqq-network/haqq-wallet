import {Alert} from 'react-native';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForWallet, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {exportWallet} from '@app/helpers/export';
import {Url} from '@app/helpers/url';
import {I18N} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {Whitelist} from '@app/models/whitelist';
import {sendNotification} from '@app/services/toast';
import {
  DataFetchSource,
  DeeplinkProtocol,
  DeeplinkUrlKey,
  ModalType,
} from '@app/types';
import {openInAppBrowser, openWeb3Browser} from '@app/utils';

import {onDynamicLink} from './on-dynamic-link';

export type ParsedQuery = {
  uri?: string;
  [key: string]: string | undefined;
};

const BROWSERS_FN = {
  [DeeplinkUrlKey.browser]: openInAppBrowser,
  [DeeplinkUrlKey.web3browser]: openWeb3Browser,
};

const logger = Logger.create('on-deep-link', {
  enabled: AppStore.isLogsEnabled,
  stringifyJson: true,
});

const handleAddress = async (
  address: string,
  withoutFromAddress: boolean = false,
) => {
  const wallets = Wallet.getAllVisible().filter(
    item => item.address.toLowerCase() !== address?.toLowerCase?.(),
  );

  if (!withoutFromAddress && wallets.length === 0) {
    return sendNotification(I18N.createOrImportWallet);
  }

  const from = withoutFromAddress
    ? null
    : await awaitForWallet({
        title: I18N.qrModalSendFunds,
        wallets,
      });

  app.emit('address', {
    to: address,
    from,
  });
};

/**
 * @returns {boolean} true if the url is handled
 */
export async function onDeepLink(
  link: string,
  withoutFromAddress: boolean = false,
  isInitialRun = false,
) {
  logger.log('onDeepLink', {link, withoutFromAddress, isInitialRun});
  try {
    if (!link) {
      return false;
    }

    if (link.startsWith('https://haqq.page.link/')) {
      return onDynamicLink({
        url: new Url<{link: string}>(link, true).query.link as string,
      });
    }

    if (AddressUtils.isHaqqAddress(link)) {
      await handleAddress(AddressUtils.toEth(link), withoutFromAddress);
      return true;
    }

    if (AddressUtils.isValidAddress(link)) {
      await handleAddress(link, withoutFromAddress);
      return true;
    }

    if (link.startsWith(`${DeeplinkProtocol.ethereum}:`)) {
      const to = link.split(':')[1];
      if (AddressUtils.isEthAddress(to)) {
        await handleAddress(to, withoutFromAddress);
        return true;
      }
    }

    if (link.startsWith(`${DeeplinkProtocol.wc}:`)) {
      const uri = decodeURIComponent(link.replace(/^wc:\/{0,2}/, ''));
      if (isInitialRun) {
        VariablesBool.set('isWalletConnectFromDeepLink', true);
      }
      app.emit(Events.onWalletConnectUri, uri);
      return true;
    }

    if (link.startsWith(`${DeeplinkProtocol.haqq}:`)) {
      const url = new Url<ParsedQuery>(link, true);
      logger.log('url', url);

      const [key, ...params] = (url.host || url.pathname || url.hostname).split(
        ':',
      );

      if (AddressUtils.isHaqqAddress(url.pathname)) {
        await handleAddress(
          AddressUtils.toEth(url.pathname),
          withoutFromAddress,
        );
        return true;
      }

      if (AddressUtils.isValidAddress(url.pathname)) {
        await handleAddress(url.pathname, withoutFromAddress);
        return true;
      }

      switch (key) {
        case DeeplinkUrlKey.wc:
          if (isInitialRun) {
            VariablesBool.set('isWalletConnectFromDeepLink', true);
          }
          app.emit(Events.onWalletConnectUri, url.query.uri || url.href);
          return true;
        case DeeplinkUrlKey.browser:
        case DeeplinkUrlKey.web3browser:
          if (await Whitelist.checkUrl(url.query.uri)) {
            const openBrowserFn = BROWSERS_FN[key];
            let uri = url.query.uri!;
            for (let qkey in url.query) {
              if (qkey !== 'uri') {
                uri += `&${qkey}=${url.query[qkey]}`;
              }
            }
            openBrowserFn(uri as string);
          } else {
            showModal(ModalType.domainBlocked, {
              domain: url.query.uri!,
            });
          }
          return true;
        case DeeplinkUrlKey.back9test:
          Alert.alert('Referral code', params[0]);
          return true;
        case DeeplinkUrlKey.enableDeveloperMode:
          AppStore.isDeveloperModeEnabled = true;
          return true;
        case DeeplinkUrlKey.enableNetworkLogger:
          AppStore.networkLoggerEnabled = true;
          return true;
        case DeeplinkUrlKey.export:
          await exportWallet();
          return true;
        case DeeplinkUrlKey.useRpc:
          AppStore.dataFetchMode = DataFetchSource.Rpc;
          return true;
      }
    }
  } catch (error) {
    Logger.captureException(error, 'onDeepLink', {link, withoutFromAddress});
  }
  return false;
}
