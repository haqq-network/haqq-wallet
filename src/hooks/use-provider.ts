import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Provider} from '@app/models/provider';

export function useProvider() {
  const [provider, setProvider] = useState(
    Provider.getById(app.providerId) as Provider,
  );

  useEffect(() => {
    const callback = () => {
      const p = Provider.getById(app.providerId);
      setProvider(p as Provider);
    };

    app.on(Events.onProviderChanged, callback);
    return () => {
      app.off(Events.onProviderChanged, callback);
    };
  }, []);

  return provider;
}
