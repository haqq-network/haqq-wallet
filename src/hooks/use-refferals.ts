import {useEffect, useState} from 'react';

import {Refferal} from '@app/models/refferal';

export const useRefferals = () => {
  const [refferals, setRefferals] = useState(Refferal.getAll().snapshot());
  useEffect(() => {
    const allRefferals = Refferal.getAll();
    const sub = () => {
      setRefferals(allRefferals.snapshot());
    };

    allRefferals.addListener(sub);

    return () => {
      allRefferals.removeListener(sub);
    };
  }, []);

  return refferals;
};
