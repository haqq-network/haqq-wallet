import {useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {Banner} from '@app/models/banner';
import {throttle} from '@app/utils';

export const useBanners = () => {
  const [banners, setBanners] = useState(Banner.getAvailable().snapshot());

  useEffect(() => {
    const handler = Banner.getAvailable();

    const listener = throttle(
      (collection: Collection<Banner>, changes: CollectionChangeSet) => {
        if (
          changes.insertions.length ||
          changes.newModifications.length ||
          changes.deletions.length
        ) {
          setBanners(handler.snapshot());
        }
      },
      500,
    );

    handler.addListener(listener);

    return () => {
      handler.removeListener(listener);
    };
  }, []);

  return banners;
};
