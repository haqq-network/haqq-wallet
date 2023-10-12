import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {sleep} from '@app/utils';

export const useIsBalancesFirstSync = () => {
  const [isBalanceLoading, setBalanceLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const listener = async (err?: Error) => {
      if (err) {
        setError(err);
        setBalanceLoading(true);
        await sleep(1000);
      }

      awaitForEventDone(Events.onWalletsBalanceCheck).then(() => {
        setBalanceLoading(!error);
        setError(null);
      });
    };

    listener();
    app.on(Events.onWalletsBalanceCheckError, listener);
    return () => {
      app.off(Events.onWalletsBalanceCheckError, listener);
    };
  }, [error]);
  return isBalanceLoading;
};
