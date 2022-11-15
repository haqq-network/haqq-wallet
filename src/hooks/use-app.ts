import {useContext} from 'react';

import {AppContext} from '@app/contexts';

export function useApp() {
  const context = useContext(AppContext);

  return context;
}
