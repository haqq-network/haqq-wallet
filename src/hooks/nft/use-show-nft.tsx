import {useEffect, useState} from 'react';

import {autorun} from 'mobx';

import {Provider} from '@app/models/provider';

export const useShowNft = () => {
  const [showNft, setShowNft] = useState(
    Provider.selectedProvider.config.isNftEnabled,
  );

  useEffect(() => {
    const disposer = autorun(() => {
      setShowNft(Provider.selectedProvider.config.isNftEnabled);
    });

    return () => {
      disposer();
    };
  }, []);

  return showNft;
};
