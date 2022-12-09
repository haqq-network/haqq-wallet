import base64 from 'react-native-base64';

import {app} from '@app/contexts';
import {navigator} from '@app/navigator';

export enum Events {
  onDeepLink = 'onDeepLink',
}

app.on(Events.onDeepLink, async (link: string) => {
  console.log('onDeepLink');
  if (link && link.startsWith('haqq:')) {
    let params = link.split(':');

    if (params.length === 2) {
      navigator.navigate('transaction', {
        to: params[1],
      });
    } else if (params.length === 3) {
      switch (params[1]) {
        case 'provider':
          navigator.navigate('homeSettings', {
            screen: 'settingsProviderForm',
            params: {data: JSON.parse(base64.decode(params[2]))},
          });
          break;
      }
    }
  }
});
