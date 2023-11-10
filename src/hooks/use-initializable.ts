import {useRef} from 'react';

import {Initializable} from '@app/helpers/initializable';

export function useInitializable<InitResult = null>() {
  return useRef(new Initializable<InitResult>()).current;
}
