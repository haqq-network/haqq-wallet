import {Alert} from 'react-native';
import base64 from 'react-native-base64';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {VariablesBool} from '@app/models/variables-bool';
import {navigator} from '@app/navigator';

export async function onDeepLink(link: string) {
  if (!link) {
    return;
  }

  if (link.startsWith('wc:')) {
    const uri = decodeURIComponent(link.replace(/^wc:\/{0,2}/, ''));
    VariablesBool.set('isWalletConnectFromDeepLink', true);
    return app.emit(Events.onWalletConnectUri, uri);
  }

  if (link.startsWith('haqq:')) {
    let params = link.split(':');

    if (link.startsWith('haqq://wc')) {
      const uri = decodeURIComponent(link.replace('haqq://wc?uri=', ''));
      VariablesBool.set('isWalletConnectFromDeepLink', true);
      return app.emit(Events.onWalletConnectUri, uri);
    }

    if (params[1].startsWith('0x')) {
      navigator.navigate('transaction', {
        to: params[1],
      });

      return;
    }

    const key = params[1].startsWith('//') ? params[1].slice(2) : params[1];

    switch (key) {
      case 'provider':
        navigator.navigate('homeSettings', {
          screen: 'settingsProviderForm',
          params: {data: JSON.parse(base64.decode(params[2]))},
        });
        break;
      case 'back9test':
        Alert.alert('Referral code', params[2]);
        break;
      case 'enableDeveloperMode':
        app.isDeveloper = true;
        break;
    }
  }
}
