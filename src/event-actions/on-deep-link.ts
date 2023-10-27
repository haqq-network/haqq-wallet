import {utils} from 'ethers';
import {Alert} from 'react-native';
import base64 from 'react-native-base64';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForWallet, showModal} from '@app/helpers';
import {Url} from '@app/helpers/url';
import {Whitelist} from '@app/helpers/whitelist';
import {I18N} from '@app/i18n';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {DeeplinkProtocol, DeeplinkUrlKey, ModalType} from '@app/types';
import {openInAppBrowser, openWeb3Browser} from '@app/utils';

type ParsedQuery = {
  uri?: string;
};

const BROWSERS_FN = {
  [DeeplinkUrlKey.browser]: openInAppBrowser,
  [DeeplinkUrlKey.web3browser]: openWeb3Browser,
};

const handleAddress = async (
  address: string,
  withoutFromAddress: boolean = false,
) => {
  const from = withoutFromAddress
    ? null
    : await awaitForWallet({
        title: I18N.qrModalSendFunds,
        wallets: Wallet.getAllVisible(),
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
  if (!link) {
    return false;
  }

  if (utils.isAddress(link)) {
    await handleAddress(link, withoutFromAddress);
    return true;
  }

  if (link.startsWith(`${DeeplinkProtocol.etherium}:`)) {
    const to = link.split(':')[1];
    if (utils.isAddress(to)) {
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

    const urlKey = url.host || url.pathname || url.hostname;

    if (utils.isAddress(urlKey)) {
      navigator.navigate('transaction', {
        to: urlKey,
      });
      return true;
    }

    switch (urlKey) {
      case DeeplinkUrlKey.wc:
        VariablesBool.set('isWalletConnectFromDeepLink', true);
        app.emit(Events.onWalletConnectUri, url.query.uri);
        return true;
      case DeeplinkUrlKey.browser:
      case DeeplinkUrlKey.web3browser:
        if (await Whitelist.check(url.query.uri)) {
          const openBrowserFn = BROWSERS_FN[urlKey];
          openBrowserFn(url.query.uri!);
        } else {
          showModal(ModalType.domainBlocked, {
            domain: url.host,
          });
        }
        return true;
      case DeeplinkUrlKey.back9test:
        Alert.alert('Referral code', link.split(':')[2]);
        return true;
      case DeeplinkUrlKey.enableDeveloperMode:
        app.isDeveloper = true;
        return true;
    }

    // TODO: improve legacy code
    let params = link.split(':');
    const key = params[1].startsWith('//') ? params[1].slice(2) : params[1];

    switch (key) {
      case DeeplinkUrlKey.provider:
        navigator.navigate('homeSettings', {
          screen: 'settingsProviderForm',
          params: {data: JSON.parse(base64.decode(params[2]))},
        });
        return true;
    }
  }

  return false;
}
