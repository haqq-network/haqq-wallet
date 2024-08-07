import {useEffect, useState} from 'react';

import {autorun} from 'mobx';

import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {RemoteProviderConfig} from '@app/models/provider';

export const useShowNft = () => {
  const [showNft, setShowNft] = useState(
    isFeatureEnabled(Feature.nft) && RemoteProviderConfig.isNftEnabled,
  );

  useEffect(() => {
    const disposer = autorun(() => {
      setShowNft(
        isFeatureEnabled(Feature.nft) && RemoteProviderConfig.isNftEnabled,
      );
    });

    return () => {
      disposer();
    };
  }, []);

  return showNft;
};
