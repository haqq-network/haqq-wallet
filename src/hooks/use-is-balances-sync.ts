import {useEffect, useState} from 'react';

import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';

export const useIsBalancesFirstSync = () => {
  const [isBalanceLoading, setBalanceLoading] = useState(true);
  useEffect(() => {
    awaitForEventDone(Events.onWalletsBalanceCheck).then(() =>
      setBalanceLoading(false),
    );
  }, []);
  return isBalanceLoading;
};
