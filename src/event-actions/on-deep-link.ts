import {Alert} from 'react-native';
import base64 from 'react-native-base64';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForWallet, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {Url} from '@app/helpers/url';
import {Whitelist} from '@app/helpers/whitelist';
import {I18N} from '@app/i18n';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {DeeplinkProtocol, DeeplinkUrlKey, ModalType} from '@app/types';
import {openInAppBrowser, openWeb3Browser} from '@app/utils';

export type ParsedQuery = {
  uri?: string;
};

const BROWSERS_FN = {
  [DeeplinkUrlKey.browser]: openInAppBrowser,
  [DeeplinkUrlKey.web3browser]: openWeb3Browser,
};

const logger = Logger.create('on-deep-link', {
  enabled: __DEV__ || app.isDeveloper || app.isTesterMode,
  stringifyJson: true,
});

const handleAddress = async (
  address: string,
  withoutFromAddress: boolean = false,
) => {
  const from = withoutFromAddress
    ? null
    : await awaitForWallet({
        title: I18N.qrModalSendFunds,
        wallets: Wallet.getAllVisible().filter(
          item => item.address.toLowerCase() !== address?.toLowerCase?.(),
        ),
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
) {
  try {
    if (!link) {
      return false;
    }

    if (AddressUtils.isEthAddress(link)) {
      await handleAddress(link, withoutFromAddress);
      return true;
    }

    if (AddressUtils.isHaqqAddress(link)) {
      await handleAddress(AddressUtils.toEth(link), withoutFromAddress);
      return true;
    }

    if (link.startsWith(`${DeeplinkProtocol.etherium}:`)) {
      const to = link.split(':')[1];
      if (AddressUtils.isEthAddress(to)) {
        await handleAddress(to, withoutFromAddress);
        return true;
      }
    }

    if (link.startsWith(`${DeeplinkProtocol.wc}:`)) {
      const uri = decodeURIComponent(link.replace(/^wc:\/{0,2}/, ''));
      VariablesBool.set('isWalletConnectFromDeepLink', true);
      app.emit(Events.onWalletConnectUri, uri);
      return true;
    }

    if (link.startsWith(`${DeeplinkProtocol.haqq}:`)) {
      const url = new Url<ParsedQuery>(link, true);
      logger.log('url', url);

      const [key, ...params] = (url.host || url.pathname || url.hostname).split(
        ':',
      );

      if (AddressUtils.isEthAddress(key)) {
        navigator.navigate('transaction', {
          to: key,
        });
        return true;
      }

      if (AddressUtils.isHaqqAddress(key)) {
        navigator.navigate('transaction', {
          to: AddressUtils.toEth(key),
        });
        return true;
      }

      switch (key) {
        case DeeplinkUrlKey.wc:
          VariablesBool.set('isWalletConnectFromDeepLink', true);
          app.emit(Events.onWalletConnectUri, url.query.uri);
          return true;
        case DeeplinkUrlKey.browser:
        case DeeplinkUrlKey.web3browser:
          if (await Whitelist.checkUrl(url.query.uri)) {
            const openBrowserFn = BROWSERS_FN[key];
            openBrowserFn(url.query.uri!);
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
          app.isDeveloper = true;
          return true;
        case DeeplinkUrlKey.provider:
          navigator.navigate('homeSettings', {
            screen: 'settingsProviderForm',
            params: {data: JSON.parse(base64.decode(params[0]))},
          });
          return true;
      }
    }
  } catch (error) {
    Logger.captureException(error, 'onDeepLink', {link, withoutFromAddress});
  }
  return false;
}
