import {useRef} from 'react';

import {createNftCollectionSet} from '@app/components/nft-viewer/mock';

export const useNftCollections = () => {
  return useRef(createNftCollectionSet()).current;
};
