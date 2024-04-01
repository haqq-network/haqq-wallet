import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {sleep} from '@app/utils';

export const useIsBalancesFirstSync = () => {
  const [isBalancesFirstSync, setBalanceLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkBalance = async () => {
      await awaitForEventDone(Events.onWalletsBalanceCheck);
    };

    const listener = async (err?: Error | null) => {
      if (err) {
        setError(err);
        await sleep(1000);
        await checkBalance();
      } else if (error === null) {
        setError(null);
        setBalanceLoading(false);
      }
    };

    checkBalance();
    app.on(Events.onWalletsBalanceCheckError, listener);
    return () => {
      app.off(Events.onWalletsBalanceCheckError, listener);
    };
  }, [error]);

  return {isBalancesFirstSync, isBalanceLoadingError: !!error};
};
