import {useRef} from 'react';

import {app} from '@app/contexts';
import {Cosmos} from '@app/services/cosmos';

export function useCosmos() {
  const cosmos = useRef(new Cosmos(app.provider!)).current;

  return cosmos;
}
