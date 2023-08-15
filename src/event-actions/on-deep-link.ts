import {utils} from 'ethers';
import {Alert} from 'react-native';
import base64 from 'react-native-base64';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForWallet} from '@app/helpers';
import {I18N} from '@app/i18n';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {ValidUrlProtocol} from '@app/types';

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

  if (link.startsWith(`${ValidUrlProtocol.etherium}:`)) {
    const to = link.split(':')[1];
    if (utils.isAddress(to)) {
      await handleAddress(to, withoutFromAddress);
      return true;
    }
  }

  if (link.startsWith(`${ValidUrlProtocol.wc}:`)) {
    const uri = decodeURIComponent(link.replace(/^wc:\/{0,2}/, ''));
    VariablesBool.set('isWalletConnectFromDeepLink', true);
    app.emit(Events.onWalletConnectUri, uri);
    return true;
  }

  if (link.startsWith(`${ValidUrlProtocol.haqq}:`)) {
    let params = link.split(':');

    if (link.startsWith('haqq://wc')) {
      const uri = decodeURIComponent(link.replace('haqq://wc?uri=', ''));
      VariablesBool.set('isWalletConnectFromDeepLink', true);
      app.emit(Events.onWalletConnectUri, uri);
      return true;
    }

    if (params[1].startsWith('0x')) {
      navigator.navigate('transaction', {
        to: params[1],
      });
      return true;
    }

    const key = params[1].startsWith('//') ? params[1].slice(2) : params[1];

    switch (key) {
      case 'provider':
        navigator.navigate('homeSettings', {
          screen: 'settingsProviderForm',
          params: {data: JSON.parse(base64.decode(params[2]))},
        });
        return true;
      case 'back9test':
        Alert.alert('Referral code', params[2]);
        return true;
      case 'enableDeveloperMode':
        app.isDeveloper = true;
        return true;
    }
  }

  return false;
}
