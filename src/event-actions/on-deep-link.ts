import {Alert} from 'react-native';
import base64 from 'react-native-base64';

import {app} from '@app/contexts';
import {navigator} from '@app/navigator';

export async function onDeepLink(link: string) {
  if (link && link.startsWith('haqq:')) {
    let params = link.split(':');

    console.log('link', link, params);

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
