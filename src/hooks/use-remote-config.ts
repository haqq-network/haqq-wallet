import {useEffect, useState} from 'react';

import {RemoteConfig, RemoteConfigTypes} from '@app/services/remote-config';

export function useRemoteConfigVar<K extends keyof RemoteConfigTypes>(key: K) {
  const [variable, setVariable] = useState(RemoteConfig.get(key));

  useEffect(() => {
    // get from cache if config in not initialized
    setVariable(RemoteConfig.get(key));

    // update value when config is initialized
    RemoteConfig.awaitForInitialization().then(() => {
      setVariable(RemoteConfig.get(key));
    });
  }, [key]);

  return variable as RemoteConfigTypes[K];
}
