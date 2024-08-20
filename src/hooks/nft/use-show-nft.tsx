import {useEffect, useState} from 'react';

import {autorun} from 'mobx';

import {RemoteProviderConfig} from '@app/models/provider';

export const useShowNft = () => {
  const [showNft, setShowNft] = useState(RemoteProviderConfig.isNftEnabled);

  useEffect(() => {
    const disposer = autorun(() => {
      setShowNft(RemoteProviderConfig.isNftEnabled);
    });

    return () => {
      disposer();
    };
  }, []);

  return showNft;
};
