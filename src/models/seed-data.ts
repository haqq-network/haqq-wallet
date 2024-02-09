import {DEFAULT_PROVIDERS} from '@app/variables/common';

import {Provider} from './provider';

import {realm} from './index';

export const seedData = () => {
  const providers = realm.objects<Provider>('Provider');

  if (!providers.length) {
    const providersList = DEFAULT_PROVIDERS;

    for (const provider of providersList) {
      realm.write(() => {
        realm.create('Provider', provider);
      });
    }
  }
};
