import {useEffect, useState} from 'react';

import {RemoteConfig, RemoteConfigTypes} from '@app/services/remote-config';

export function useRemoteConfigVar<K extends keyof RemoteConfigTypes>(key: K) {
  const [variable, setVariable] = useState(RemoteConfig.get(key));

  useEffect(() => {
    const asyncTask = async () => {
      if (!RemoteConfig.isInited) {
        await RemoteConfig.init();
        setVariable(RemoteConfig.get(key));
      }
    };

    asyncTask();
  });

  return variable as RemoteConfigTypes[K] | undefined;
}
