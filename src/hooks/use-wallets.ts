import {useContext} from 'react';

import {WalletsContext} from '@app/contexts';

export function useWallets() {
  const context = useContext(WalletsContext);

  return context;
}
