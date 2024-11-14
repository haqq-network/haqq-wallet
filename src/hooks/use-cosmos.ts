import {useRef} from 'react';

import {Provider} from '@app/models/provider';
import {Cosmos} from '@app/services/cosmos';

export function useCosmos() {
  const cosmos = useRef(new Cosmos(Provider.selectedProvider)).current;

  return cosmos;
}
