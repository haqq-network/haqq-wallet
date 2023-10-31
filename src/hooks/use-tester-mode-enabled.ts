import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';

export const useTesterModeEnabled = () => {
  const [enabled, setEnabled] = useState(app.isTesterMode);

  useEffect(() => {
    const listener = (value: boolean) => {
      setEnabled(value);
    };
    app.on(Events.onTesterModeChanged, listener);
    return () => {
      app.off(Events.onTesterModeChanged, listener);
    };
  }, []);

  return enabled;
};
