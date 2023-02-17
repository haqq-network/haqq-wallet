import queryString from 'query-string';
import {Alert} from 'react-native';
import base64 from 'react-native-base64';

import {navigator} from '@app/navigator';

export async function onDeepLink(link: string) {
  let deepLink: string | null = link;

  if (!deepLink) {
    return;
  }

  if (deepLink.startsWith('https://haqq.page.link')) {
    const uri = queryString.parse(link);
    deepLink = String(uri.link || uri['https://haqq.page.link/?link'] || '');
  }

  if (deepLink.startsWith('https://haqq.network')) {
    const uri = queryString.parse(deepLink);
    deepLink = String(uri.p || uri['https://haqq.network?p'] || '');
  }

  if (deepLink.startsWith('haqq:')) {
    let params = deepLink.split(':');

    if (params.length === 2) {
      navigator.navigate('transaction', {
        to: params[1],
      });
    } else if (params.length === 3) {
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
      }
    }
  }
}
