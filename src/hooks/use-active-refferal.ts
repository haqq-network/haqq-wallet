import {useMemo} from 'react';

import {useRefferals} from './use-refferals';

export const useActiveRefferal = () => {
  const refferals = useRefferals();
  return useMemo(() => {
    return refferals?.find(refferal => {
      // TODO: replace conditon
      if (!refferal.isUsed) {
        return refferal;
      }
    });
  }, [refferals]);
};
