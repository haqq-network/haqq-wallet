import {Provider} from './provider';
import {realm} from './index';

export const migration = () => {
  const providers = realm.objects<Provider>('Provider');

  if (!providers.length) {
    const providersList = require('../../assets/migrations/providers.json');

    for (const provider of providersList) {
      realm.write(() => {
        realm.create('Provider', provider);
      });
    }
  }
};
