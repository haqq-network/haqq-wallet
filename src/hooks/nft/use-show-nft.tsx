import {useEffect, useState} from 'react';

import {autorun} from 'mobx';

import {app} from '@app/contexts';

export const useShowNft = () => {
  const [showNft, setShowNft] = useState(app.provider.config.isNftEnabled);

  useEffect(() => {
    const disposer = autorun(() => {
      setShowNft(app.provider.config.isNftEnabled);
    });

    return () => {
      disposer();
    };
  }, []);

  return showNft;
};
